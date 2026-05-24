import { Pressable, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import { RADIUS, SHADOW, SPACING } from '@/constants/theme'

interface Props {
  onPress: () => void
  icon?: string
  label?: string
}

export function FAB({ onPress, icon = '+', label }: Props) {
  const { colors } = useTheme()
  return (
    <Pressable
      style={[styles.fab, { backgroundColor: colors.accent }, SHADOW.md]}
      onPress={onPress}
    >
      <Text style={styles.icon}>{icon}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { color: '#fff', fontSize: 28, lineHeight: 32 },
  label: { color: '#fff', fontSize: 12, marginTop: 2 },
})
