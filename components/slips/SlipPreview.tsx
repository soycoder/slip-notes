import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Image } from 'react-native'
import type { SlipData, BankCode } from '@/types/slip'
import { BANKS } from '@/constants/banks'
import { useTheme } from '@/context/ThemeContext'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme'

const BANK_CODES = Object.keys(BANKS).filter((b) => b !== 'UNKNOWN') as BankCode[]

interface Props {
  slipData: SlipData
  imageUri?: string
  onChange: (updated: SlipData) => void
  onConfirm: () => void
  onCancel: () => void
}

export function SlipPreview({ slipData, imageUri, onChange, onConfirm, onCancel }: Props) {
  const { colors } = useTheme()

  function update(field: keyof SlipData, value: SlipData[typeof field]) {
    onChange({ ...slipData, [field]: value })
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AMOUNT (THB)</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgSurface }]}
          value={String(slipData.amount)}
          onChangeText={(v) => update('amount', parseFloat(v.replace(/,/g, '')) || 0)}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RECIPIENT</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgSurface }]}
          value={slipData.recipientName}
          onChangeText={(v) => update('recipientName', v)}
          placeholder="Recipient name"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BANK</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.bankRow}>
            {BANK_CODES.map((code) => (
              <Pressable
                key={code}
                style={[
                  styles.bankChip,
                  { borderColor: slipData.recipientBank === code ? BANKS[code].color : colors.border },
                  slipData.recipientBank === code && { backgroundColor: BANKS[code].color + '20' },
                ]}
                onPress={() => update('recipientBank', code)}
              >
                <Text style={[styles.bankChipText, { color: slipData.recipientBank === code ? BANKS[code].color : colors.textSecondary }]}>
                  {BANKS[code].shortName}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATE</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.bgSurface }]}
          value={slipData.transactionDate ? new Date(slipData.transactionDate).toLocaleDateString('th-TH') : ''}
          onChangeText={(v) => update('transactionDate', v)}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.btnRow}>
        <Pressable style={[styles.btn, { backgroundColor: colors.bgElevated }]} onPress={onCancel}>
          <Text style={[styles.btnText, { color: colors.textSecondary }]}>Retake</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={onConfirm}>
          <Text style={[styles.btnText, { color: '#fff' }]}>Save Slip</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 220, marginBottom: SPACING.lg },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, letterSpacing: 0.8, marginBottom: SPACING.xs },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  bankRow: { flexDirection: 'row', gap: SPACING.sm },
  bankChip: {
    borderWidth: 1.5,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  bankChipText: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  btn: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  btnText: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold },
})
