import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { format } from 'date-fns'
import type { Note } from '@/types/note'
import { BANKS } from '@/constants/banks'
import { useTheme } from '@/context/ThemeContext'
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '@/constants/theme'

interface Props {
  note: Note
  onDelete?: (id: string) => void
}

export function SlipCard({ note, onDelete }: Props) {
  const { colors } = useTheme()
  const router = useRouter()
  const slip = note.slipData

  if (!slip) return null

  const bank = BANKS[slip.recipientBank]
  const dateStr = (() => {
    try {
      return format(new Date(slip.transactionDate), 'dd MMM yyyy')
    } catch {
      return slip.transactionDate
    }
  })()

  return (
    <Pressable
      style={[styles.card, SHADOW.sm, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}
      onPress={() => router.push(`/slip/${note.id}`)}
    >
      <View style={[styles.bankBar, { backgroundColor: bank.color + '20' }]}>
        <Text style={[styles.bankName, { color: bank.color }]}>{bank.shortName}</Text>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>
          ฿{slip.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={[styles.recipient, { color: colors.textPrimary }]} numberOfLines={1}>
          {slip.recipientName || 'Unknown recipient'}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{dateStr}</Text>
      </View>

      {onDelete && (
        <Pressable onPress={() => onDelete(note.id)} hitSlop={8} style={styles.deleteBtn}>
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>🗑</Text>
        </Pressable>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  bankBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bankName: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold },
  amount: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold },
  details: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipient: { fontSize: FONT_SIZE.md, flex: 1 },
  date: { fontSize: FONT_SIZE.sm, marginLeft: SPACING.sm },
  deleteBtn: { position: 'absolute', top: SPACING.sm, right: SPACING.sm },
})
