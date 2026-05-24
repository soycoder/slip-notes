import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useTheme } from '@/context/ThemeContext'
import { RADIUS, SPACING } from '@/constants/theme'

function SkeletonBox({ width, height }: { width: number | string; height: number }) {
  const { colors } = useTheme()
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.box,
        { width: width as number, height, backgroundColor: colors.border, opacity, borderRadius: RADIUS.sm },
      ]}
    />
  )
}

export function NoteCardSkeleton() {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
      <SkeletonBox width="60%" height={16} />
      <View style={{ height: SPACING.sm }} />
      <SkeletonBox width="100%" height={12} />
      <View style={{ height: SPACING.xs }} />
      <SkeletonBox width="85%" height={12} />
      <View style={{ height: SPACING.xs }} />
      <SkeletonBox width="70%" height={12} />
      <View style={{ height: SPACING.md }} />
      <SkeletonBox width={60} height={10} />
    </View>
  )
}

const styles = StyleSheet.create({
  box: {},
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
})
