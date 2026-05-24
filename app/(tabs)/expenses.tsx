import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNotes } from '@/hooks/useNotes'
import { useSlips } from '@/hooks/useSlips'
import { useExpenses } from '@/hooks/useExpenses'
import { SlipCard } from '@/components/slips/SlipCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { BANKS } from '@/constants/banks'
import { useTheme } from '@/context/ThemeContext'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/theme'

export default function ExpensesScreen() {
  const { colors } = useTheme()
  const { deleteNote } = useNotes()
  const { slips } = useSlips()
  const { months, totalAllTime, currentMonth, topBanks } = useExpenses(slips)

  if (slips.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Expenses</Text>
        </View>
        <EmptyState
          emoji="💳"
          title="No expense slips yet"
          subtitle="Tap 📷 in Notes to capture your first bank transfer slip"
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Expenses</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            label="This Month"
            value={currentMonth ? `฿${currentMonth.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` : '—'}
            sub={currentMonth ? `${currentMonth.slipCount} slips` : 'No slips this month'}
            colors={colors}
          />
          <SummaryCard
            label="All Time"
            value={`฿${totalAllTime.toLocaleString('th-TH', { minimumFractionDigits: 0 })}`}
            sub={`${slips.length} total slips`}
            colors={colors}
          />
        </View>

        {/* Monthly breakdown */}
        {months.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BY MONTH</Text>
            {months.slice(0, 6).map((m) => (
              <View key={`${m.year}-${m.month}`} style={[styles.monthRow, { borderColor: colors.border }]}>
                <Text style={[styles.monthLabel, { color: colors.textPrimary }]}>
                  {new Date(m.year, m.month - 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </Text>
                <View style={styles.monthRight}>
                  <Text style={[styles.monthCount, { color: colors.textMuted }]}>{m.slipCount} slips</Text>
                  <Text style={[styles.monthAmount, { color: colors.textPrimary }]}>
                    ฿{m.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Top banks */}
        {topBanks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TOP BANKS</Text>
            {topBanks.slice(0, 5).map(({ bank, total }) => {
              const info = BANKS[bank]
              const pct = totalAllTime > 0 ? total / totalAllTime : 0
              return (
                <View key={bank} style={styles.bankRow}>
                  <View style={[styles.bankDot, { backgroundColor: info.color }]} />
                  <Text style={[styles.bankName, { color: colors.textPrimary }]}>{info.shortName}</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { width: `${Math.round(pct * 100)}%`, backgroundColor: info.color + '80' }]} />
                  </View>
                  <Text style={[styles.bankAmount, { color: colors.textSecondary }]}>
                    ฿{total.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Recent slips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RECENT SLIPS</Text>
          {slips.slice(0, 10).map((slip) => (
            <SlipCard key={slip.id} note={slip} onDelete={deleteNote} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function SummaryCard({ label, value, sub, colors }: { label: string; value: string; sub: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.summarySub, { color: colors.textSecondary }]}>{sub}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  summaryRow: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg },
  summaryCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  summaryLabel: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, letterSpacing: 0.8, marginBottom: SPACING.xs },
  summaryValue: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, marginBottom: 2 },
  summarySub: { fontSize: FONT_SIZE.sm },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, letterSpacing: 0.8, marginBottom: SPACING.md },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACING.sm,
  },
  monthLabel: { fontSize: FONT_SIZE.md, flex: 1 },
  monthRight: { alignItems: 'flex-end' },
  monthCount: { fontSize: FONT_SIZE.xs },
  monthAmount: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold },
  bankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  bankDot: { width: 10, height: 10, borderRadius: 5 },
  bankName: { fontSize: FONT_SIZE.sm, width: 70 },
  barContainer: { flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: RADIUS.full, overflow: 'hidden' },
  bar: { height: 8, borderRadius: RADIUS.full },
  bankAmount: { fontSize: FONT_SIZE.sm, width: 80, textAlign: 'right' },
})
