import { useState } from 'react'
import * as FileSystem from 'expo-file-system'
import { parseSlipText } from '@/lib/slipParser'
import type { ParsedSlip } from '@/types/slip'

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function processImage(imageUri: string): Promise<ParsedSlip> {
    setIsProcessing(true)
    setError(null)

    try {
      // Ensure we have a local file:// URI
      let localUri = imageUri
      if (!imageUri.startsWith('file://')) {
        const dest = `${FileSystem.cacheDirectory}slip_ocr_${Date.now()}.jpg`
        const { uri } = await FileSystem.downloadAsync(imageUri, dest)
        localUri = uri
      }

      // Dynamic import so the module only loads on native (not web/test)
      const TextRecognition = await import('@react-native-ml-kit/text-recognition').then(
        (m) => m.default
      )
      const result = await TextRecognition.recognize(localUri)

      const rawText = result.text
      const parsed = parseSlipText(rawText)

      // Inject average ML Kit confidence
      if (parsed.data && result.blocks.length > 0) {
        const avgConf =
          result.blocks.reduce((sum: number, b: { confidence?: number }) => sum + (b.confidence ?? 0.9), 0) /
          result.blocks.length
        parsed.data.confidence = avgConf
      }

      return parsed
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'OCR failed'
      setError(msg)
      return { success: false, data: null, errors: ['ocr_error'] }
    } finally {
      setIsProcessing(false)
    }
  }

  return { processImage, isProcessing, error }
}
