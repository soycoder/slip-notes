import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import { FONT_SIZE, RADIUS, SPACING } from '@/constants/theme'

interface Props {
  label: string
  onRemove?: () => void
}

export function TagChip({ label, onRemove }: Props) {
  const { colors } = useTheme()
  return (
    <View style={[styles.chip, { backgroundColor: colors.bgElevated, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>#{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={6} style={styles.removeBtn}>
          <Text style={[styles.removeText, { color: colors.textMuted }]}>✕</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  text: { fontSize: FONT_SIZE.xs, fontWeight: '500' },
  removeBtn: { marginLeft: 4 },
  removeText: { fontSize: 10 },
})
