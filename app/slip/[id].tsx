import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format } from 'date-fns'
import { useNotes } from '@/hooks/useNotes'
import { BANKS } from '@/constants/banks'
import { useTheme } from '@/context/ThemeContext'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme'

export default function SlipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const { notes } = useNotes()
  const router = useRouter()

  const note = notes.find((n) => n.id === id)
  const slip = note?.slipData

  if (!note || !slip) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
        <Text style={[styles.notFound, { color: colors.textMuted }]}>Slip not found</Text>
      </SafeAreaView>
    )
  }

  const bank = BANKS[slip.recipientBank]
  const dateStr = (() => {
    try {
      return format(new Date(slip.transactionDate), 'dd MMMM yyyy')
    } catch {
      return slip.transactionDate
    }
  })()

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.backBtn, { color: colors.accent }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Slip Detail</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {note.slipImageUri && (
          <Image
            source={{ uri: note.slipImageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        <View style={[styles.amountBox, { backgroundColor: bank.color + '15' }]}>
          <Text style={[styles.amount, { color: bank.color }]}>
            ฿{slip.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.currency, { color: colors.textSecondary }]}>Thai Baht</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
          <Row label="Bank" value={`${bank.name} (${bank.shortName})`} colors={colors} />
          <Row label="Recipient" value={slip.recipientName || '—'} colors={colors} />
          <Row label="Date" value={dateStr} colors={colors} />
          {slip.transactionTime && <Row label="Time" value={slip.transactionTime} colors={colors} />}
          {slip.referenceNumber && <Row label="Reference" value={slip.referenceNumber} colors={colors} />}
          <Row label="Confidence" value={`${Math.round(slip.confidence * 100)}%`} colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{value}</Text>
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
  notFound: { padding: SPACING.xl, textAlign: 'center' },
  image: { width: '100%', height: 250, backgroundColor: '#F0F0F0' },
  amountBox: {
    alignItems: 'center',
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  amount: { fontSize: 40, fontWeight: FONT_WEIGHT.bold },
  currency: { fontSize: FONT_SIZE.sm, marginTop: 4 },
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
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
    borderBottomColor: '#E5E7EB',
  },
  rowLabel: { fontSize: FONT_SIZE.sm },
  rowValue: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, flex: 1, textAlign: 'right' },
})
