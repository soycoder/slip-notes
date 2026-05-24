import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import { FONT_SIZE, SPACING } from '@/constants/theme'

interface Props {
  emoji: string
  title: string
  subtitle?: string
}

export function EmptyState({ emoji, title, subtitle }: Props) {
  const { colors } = useTheme()
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle && <Text style={[styles.sub, { color: colors.textMuted }]}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emoji: { fontSize: 48, marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.lg, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.sm },
  sub: { fontSize: FONT_SIZE.md, textAlign: 'center' },
})
