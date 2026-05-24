import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme'

interface Props {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChangeText, placeholder = 'Search notes…' }: Props) {
  const { colors } = useTheme()
  return (
    <View style={[styles.container, { backgroundColor: colors.bgElevated, borderColor: colors.border }]}>
      <Text style={[styles.icon, { color: colors.textMuted }]}>🔍</Text>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Text style={[styles.clear, { color: colors.textMuted }]}>✕</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  icon: { fontSize: 16, marginRight: SPACING.sm },
  input: { flex: 1, fontSize: FONT_SIZE.md, padding: 0 },
  clear: { fontSize: 14, paddingLeft: SPACING.sm },
})
