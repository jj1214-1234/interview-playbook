import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';

/**
 * Purchases architecture
 * ----------------------
 * This module has two implementations selected once, at load time:
 *
 *  - MOCK MODE (default in local development / demos): active whenever
 *    EXPO_PUBLIC_REVENUECAT_API_KEY is empty/unset, or
 *    EXPO_PUBLIC_MOCK_PURCHASES=true is set. Nothing here ever touches the
 *    network or the native RevenueCat SDK; "unlocked" is a boolean in
 *    AsyncStorage that purchaseFullPlaybook()/restorePurchases() flip.
 *
 *  - REAL MODE: active once a real RevenueCat API key is configured and
 *    mock mode is not forced. This talks to the actual react-native-purchases
 *    SDK (which requires a Dev Client / native build -- it does not work in
 *    plain Expo Go).
 *
 * Every exported function behaves identically from a caller's point of
 * view in both modes; UI code should never need to check IS_MOCK_MODE
 * itself except to render the "MOCK MODE" dev badge.
 */

/** RevenueCat entitlement identifier that unlocks categories #3-10. */
export const ENTITLEMENT_ID = 'full_playbook';

/** Store/RevenueCat product identifier for the single non-consumable unlock. */
export const PRODUCT_ID = 'full_playbook_unlock';

const MOCK_STORAGE_KEY = 'mock_full_playbook_unlocked';

const REVENUECAT_API_KEY = (process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '').trim();
const FORCE_MOCK = process.env.EXPO_PUBLIC_MOCK_PURCHASES === 'true';

/**
 * True when this app is running against the local mock instead of the real
 * RevenueCat SDK. Read this (only) to decide whether to render the
 * dev-only "MOCK MODE" badge -- app logic should just call the functions
 * below and not branch on this itself.
 */
export const IS_MOCK_MODE = FORCE_MOCK || REVENUECAT_API_KEY.length === 0;

/**
 * Configures the purchases SDK. Call this once, as early as possible (the
 * root layout does this), before any other function in this module is used.
 * No-op in mock mode.
 */
export function configurePurchases(): void {
  if (IS_MOCK_MODE) {
    if (__DEV__) {
      console.log(
        '[purchases] MOCK MODE is active (no EXPO_PUBLIC_REVENUECAT_API_KEY configured, or ' +
          'EXPO_PUBLIC_MOCK_PURCHASES=true). Purchases are simulated locally via AsyncStorage -- ' +
          'no RevenueCat SDK call and no network request will be made.'
      );
    }
    return;
  }

  Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
}

// ---------------------------------------------------------------------------
// Mock mode internals
// ---------------------------------------------------------------------------

/**
 * Tiny pub/sub so every mounted useEntitlement() hook re-renders right
 * after a mock purchase or restore, since AsyncStorage itself has no
 * change-notification mechanism.
 */
type MockListener = () => void;
const mockListeners = new Set<MockListener>();

function notifyMockListeners(): void {
  mockListeners.forEach((listener) => listener());
}

async function readMockUnlocked(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(MOCK_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    if (__DEV__) {
      console.warn('[purchases] Failed to read mock unlock state:', error);
    }
    return false;
  }
}

async function writeMockUnlocked(unlocked: boolean): Promise<void> {
  await AsyncStorage.setItem(MOCK_STORAGE_KEY, unlocked ? 'true' : 'false');
  notifyMockListeners();
}

// ---------------------------------------------------------------------------
// Real mode internals
// ---------------------------------------------------------------------------

function hasFullPlaybookEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
}

function findPackageForProduct(offering: PurchasesOffering | null | undefined) {
  return offering?.availablePackages.find((pkg) => pkg.product.identifier === PRODUCT_ID);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface EntitlementState {
  /** Whether the "full_playbook" entitlement is currently active. */
  unlocked: boolean;
  /** True until the first real/mock lookup has resolved. */
  loading: boolean;
}

/**
 * Hook exposing whether the "full_playbook" entitlement is active, and
 * whether that state is still being determined. Identical behavior from a
 * caller's point of view in mock and real mode; re-renders automatically
 * after purchaseFullPlaybook()/restorePurchases() resolve.
 */
export function useEntitlement(): EntitlementState {
  const [state, setState] = useState<EntitlementState>({ unlocked: false, loading: true });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (IS_MOCK_MODE) {
      const refresh = () => {
        readMockUnlocked().then((unlocked) => {
          if (!cancelled && isMountedRef.current) {
            setState({ unlocked, loading: false });
          }
        });
      };

      refresh();
      mockListeners.add(refresh);
      return () => {
        cancelled = true;
        mockListeners.delete(refresh);
      };
    }

    // Real mode.
    const onCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
      if (!cancelled && isMountedRef.current) {
        setState({ unlocked: hasFullPlaybookEntitlement(customerInfo), loading: false });
      }
    };

    Purchases.getCustomerInfo()
      .then(onCustomerInfoUpdate)
      .catch((error: unknown) => {
        if (__DEV__) {
          console.warn('[purchases] getCustomerInfo failed:', error);
        }
        if (!cancelled && isMountedRef.current) {
          setState({ unlocked: false, loading: false });
        }
      });

    Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdate);
    return () => {
      cancelled = true;
      Purchases.removeCustomerInfoUpdateListener(onCustomerInfoUpdate);
    };
  }, []);

  return state;
}

/**
 * Purchases the single "Full Playbook" non-consumable unlock.
 *
 * Mock mode: simulates network latency (600-900ms), then flips the local
 * AsyncStorage flag and notifies every useEntitlement() hook.
 *
 * Real mode: fetches current offerings, finds the package configured for
 * PRODUCT_ID ("full_playbook_unlock") and purchases it through RevenueCat.
 */
export async function purchaseFullPlaybook(): Promise<void> {
  if (IS_MOCK_MODE) {
    const delayMs = 600 + Math.floor(Math.random() * 300); // 600-900ms
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    await writeMockUnlocked(true);
    return;
  }

  const offerings = await Purchases.getOfferings();
  const candidateOfferings = [
    offerings.current,
    ...Object.values(offerings.all),
  ];

  let packageToPurchase: ReturnType<typeof findPackageForProduct> | undefined;
  for (const offering of candidateOfferings) {
    packageToPurchase = findPackageForProduct(offering);
    if (packageToPurchase) break;
  }

  if (!packageToPurchase) {
    throw new Error(
      `No RevenueCat package found for product "${PRODUCT_ID}". Check the current offering ` +
        'in the RevenueCat dashboard.'
    );
  }

  await Purchases.purchasePackage(packageToPurchase);
}

/**
 * Restores prior purchases.
 *
 * Mock mode: re-reads (and re-broadcasts) the local AsyncStorage flag --
 * there is nothing to restore from a server, but this keeps the function's
 * contract ("re-sync entitlement state") identical to real mode.
 *
 * Real mode: calls RevenueCat's restore flow.
 */
export async function restorePurchases(): Promise<void> {
  if (IS_MOCK_MODE) {
    notifyMockListeners();
    return;
  }

  await Purchases.restorePurchases();
}
