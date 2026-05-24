import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { supabase } from '@/lib/supabaseClient'
import { useTheme } from '@/context/ThemeContext'
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme'

export default function LoginScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function sendMagicLink() {
    if (!email.trim()) return
    setIsSending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: 'slipnotes://login' },
    })
    setIsSending(false)
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message })
    } else {
      setSent(true)
    }
  }

  const s = styles(colors)

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.inner}>
        <Text style={s.logo}>SlipNotes</Text>
        <Text style={s.tagline}>Capture thoughts & track expenses</Text>

        {sent ? (
          <View style={s.sentBox}>
            <Text style={s.sentTitle}>Check your email</Text>
            <Text style={s.sentBody}>
              We sent a magic link to {email}. Tap it to sign in.
            </Text>
            <Pressable style={s.skipBtn} onPress={() => router.replace('/(tabs)')}>
              <Text style={s.skipText}>Continue without signing in</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <TextInput
              style={s.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable style={s.btn} onPress={sendMagicLink} disabled={isSending}>
              {isSending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Send Magic Link</Text>
              )}
            </Pressable>
            <Pressable style={s.skipBtn} onPress={() => router.replace('/(tabs)')}>
              <Text style={s.skipText}>Skip — use locally without account</Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    inner: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: SPACING.xl,
    },
    logo: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    tagline: {
      fontSize: FONT_SIZE.md,
      color: colors.textSecondary,
      marginBottom: SPACING.xxxl,
    },
    input: {
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      fontSize: FONT_SIZE.md,
      color: colors.textPrimary,
      marginBottom: SPACING.md,
    },
    btn: {
      backgroundColor: colors.accent,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    btnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '600' },
    skipBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
    skipText: { color: colors.textSecondary, fontSize: FONT_SIZE.sm },
    sentBox: { alignItems: 'center' },
    sentTitle: { fontSize: FONT_SIZE.xl, fontWeight: '600', color: colors.textPrimary, marginBottom: SPACING.sm },
    sentBody: { fontSize: FONT_SIZE.md, color: colors.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  })
