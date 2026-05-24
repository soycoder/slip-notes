import { View, Pressable, StyleSheet, ScrollView } from 'react-native'
import type { NoteColor } from '@/types/note'
import { NOTE_COLORS } from '@/constants/colors'
import { useTheme } from '@/context/ThemeContext'
import { RADIUS, SPACING } from '@/constants/theme'

interface Props {
  value: NoteColor
  onChange: (color: NoteColor) => void
}

const COLOR_KEYS = Object.keys(NOTE_COLORS) as NoteColor[]

export function ColorPicker({ value, onChange }: Props) {
  const { theme } = useTheme()

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {COLOR_KEYS.map((color) => {
          const c = NOTE_COLORS[color][theme]
          const isSelected = value === color
          return (
            <Pressable
              key={color}
              style={[
                styles.swatch,
                { backgroundColor: c.bg, borderColor: c.border },
                isSelected && styles.selected,
              ]}
              onPress={() => onChange(color)}
              hitSlop={4}
            />
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  selected: {
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
})
