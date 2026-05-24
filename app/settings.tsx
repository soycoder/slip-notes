import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme'

export default function SettingsScreen() {
  const { colors, theme, toggle } = useTheme()
  const { user, signOut } = useAuth()
  const router = useRouter()

  function handleSignOut() {
    Alert.alert('Sign Out', 'Your notes stay saved locally.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/(tabs)')
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView>
        {/* Account */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          {user ? (
            <>
              <Row label="Signed in as" value={user.email ?? ''} colors={colors} />
              <Pressable style={styles.row} onPress={handleSignOut}>
                <Text style={[styles.rowLabel, { color: colors.danger }]}>Sign Out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.row}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={[styles.rowLabel, { color: colors.accent }]}>
                Sign In to sync across devices
              </Text>
              <Text style={[styles.rowChevron, { color: colors.textMuted }]}>›</Text>
            </Pressable>
          )}
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* About */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <Row label="Version" value="1.0.0" colors={colors} />
          <Row label="OCR Engine" value="ML Kit (on-device)" colors={colors} />
          <Row label="Storage" value={user ? 'Supabase + Local' : 'Local only'} colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.textSecondary }]} numberOfLines={1}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { fontSize: FONT_SIZE.md },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold },
  sectionHeader: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 0.8,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  card: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  rowLabel: { fontSize: FONT_SIZE.md },
  rowValue: { fontSize: FONT_SIZE.md, flex: 1, textAlign: 'right', marginLeft: SPACING.md },
  rowChevron: { fontSize: FONT_SIZE.lg, marginLeft: SPACING.sm },
})
