import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { useOCR } from '@/hooks/useOCR'
import { useSlips } from '@/hooks/useSlips'
import { SlipPreview } from '@/components/slips/SlipPreview'
import { useTheme } from '@/context/ThemeContext'
import type { SlipData } from '@/types/slip'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme'

type Step = 'pick' | 'processing' | 'preview' | 'saving'

export default function SlipCaptureScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const { processImage, isProcessing } = useOCR()
  const { createSlip } = useSlips()

  const [step, setStep] = useState<Step>('pick')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [slipData, setSlipData] = useState<SlipData | null>(null)

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to capture slips.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (!result.canceled && result.assets[0]) {
      await runOCR(result.assets[0].uri)
    }
  }

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (!result.canceled && result.assets[0]) {
      await runOCR(result.assets[0].uri)
    }
  }

  async function runOCR(uri: string) {
    setImageUri(uri)
    setStep('processing')
    const parsed = await processImage(uri)
    if (parsed.data) {
      setSlipData(parsed.data)
      setStep('preview')
    } else {
      Alert.alert(
        'Could not read slip',
        'Make sure the image is clear and well-lit. You can also enter details manually.',
        [
          { text: 'Try Again', onPress: () => setStep('pick') },
          {
            text: 'Enter Manually',
            onPress: () => {
              setSlipData({
                amount: 0,
                currency: 'THB',
                recipientName: '',
                recipientBank: 'UNKNOWN',
                senderBank: 'UNKNOWN',
                transactionDate: new Date().toISOString(),
                transactionTime: null,
                referenceNumber: null,
                rawOcrText: '',
                confidence: 0,
                parsedAt: new Date().toISOString(),
              })
              setStep('preview')
            },
          },
        ]
      )
    }
  }

  function handleConfirm() {
    if (!slipData) return
    setStep('saving')
    createSlip({ slipData, slipImageUri: imageUri ?? undefined })
    Toast.show({ type: 'success', text1: 'Slip saved', text2: `฿${slipData.amount.toLocaleString('th-TH')}` })
    router.back()
  }

  if (step === 'processing') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.processingText, { color: colors.textSecondary }]}>
            Reading slip…
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (step === 'preview' && slipData) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
        <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Confirm Slip</Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
        </View>
        <SlipPreview
          slipData={slipData}
          imageUri={imageUri ?? undefined}
          onChange={setSlipData}
          onConfirm={handleConfirm}
          onCancel={() => setStep('pick')}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Capture Slip</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <Text style={[styles.emoji, { color: colors.textPrimary }]}>📷</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Photograph a Thai bank transfer slip to auto-extract the amount, recipient, and date.
        </Text>

        <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={pickFromCamera}>
          <Text style={styles.btnText}>Take Photo</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: colors.bgSurface, borderColor: colors.border, borderWidth: 1 }]} onPress={pickFromGallery}>
          <Text style={[styles.btnText, { color: colors.textPrimary }]}>Choose from Gallery</Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold },
  cancelText: { fontSize: FONT_SIZE.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  emoji: { fontSize: 64, marginBottom: SPACING.lg },
  processingText: { fontSize: FONT_SIZE.md, marginTop: SPACING.lg },
  hint: { fontSize: FONT_SIZE.md, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 22 },
  btn: {
    width: '100%',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  btnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold },
})
