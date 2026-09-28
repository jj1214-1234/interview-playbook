import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';

/**
 * Renders a section's `body` string using the content model's small
 * markdown-ish convention (see lib/types.ts):
 *  - "\n\n" separates paragraph blocks
 *  - within a block, a line starting with "- " is a bullet item; any
 *    plain line before a run of bullets is rendered as a lead-in line
 *    above them (e.g. "Conflict with a peer:" followed by 3 example
 *    phrasings).
 */

type BodyRun = { type: 'text'; text: string } | { type: 'bullets'; items: string[] };

function parseBody(body: string): BodyRun[][] {
  return body
    .split(/\n\n+/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter((line) => line.length > 0))
    .filter((lines) => lines.length > 0)
    .map((lines) => {
      const runs: BodyRun[] = [];
      let bulletBuffer: string[] = [];
      const flush = () => {
        if (bulletBuffer.length > 0) {
          runs.push({ type: 'bullets', items: bulletBuffer });
          bulletBuffer = [];
        }
      };
      for (const line of lines) {
        if (line.startsWith('- ')) {
          bulletBuffer.push(line.slice(2).trim());
        } else {
          flush();
          runs.push({ type: 'text', text: line });
        }
      }
      flush();
      return runs;
    });
}

export function SectionBody({ body }: { body: string }) {
  const blocks = parseBody(body);

  return (
    <View>
      {blocks.map((runs, blockIndex) => (
        <View
          key={blockIndex}
          style={blockIndex < blocks.length - 1 ? styles.block : styles.lastBlock}
        >
          {runs.map((run, runIndex) =>
            run.type === 'text' ? (
              <Text key={runIndex} style={[typography.body, runIndex > 0 && styles.leadIn]}>
                {run.text}
              </Text>
            ) : (
              <View key={runIndex} style={styles.bulletList}>
                {run.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>{'•'}</Text>
                    <Text style={[typography.body, styles.bulletText]}>{item}</Text>
                  </View>
                ))}
              </View>
            )
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.lg,
  },
  lastBlock: {
    marginBottom: 0,
  },
  leadIn: {
    marginTop: spacing.sm,
  },
  bulletList: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletMark: {
    color: colors.accent,
    fontSize: 15,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
  },
});
