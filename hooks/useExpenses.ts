import { useMemo } from 'react'
import type { Note } from '@/types/note'
import type { BankCode, ExpenseMonth } from '@/types/slip'

export function useExpenses(slips: Note[]) {
  const months = useMemo<ExpenseMonth[]>(() => {
    const map = new Map<string, ExpenseMonth>()

    for (const slip of slips) {
      if (!slip.slipData) continue
      const date = new Date(slip.slipData.transactionDate)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`

      if (!map.has(key)) {
        map.set(key, {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          totalAmount: 0,
          slipCount: 0,
          byBank: {},
        })
      }

      const entry = map.get(key)!
      entry.totalAmount += slip.slipData.amount
      entry.slipCount += 1

      const bank = slip.slipData.recipientBank
      entry.byBank[bank] = (entry.byBank[bank] ?? 0) + slip.slipData.amount
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
  }, [slips])

  const totalAllTime = useMemo(
    () => slips.reduce((sum, s) => sum + (s.slipData?.amount ?? 0), 0),
    [slips]
  )

  const currentMonth = useMemo(() => {
    const d = new Date()
    return months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth() + 1)
  }, [months])

  const topBanks = useMemo<{ bank: BankCode; total: number }[]>(() => {
    const bankTotals = new Map<BankCode, number>()
    for (const slip of slips) {
      if (!slip.slipData) continue
      const b = slip.slipData.recipientBank
      bankTotals.set(b, (bankTotals.get(b) ?? 0) + slip.slipData.amount)
    }
    return Array.from(bankTotals.entries())
      .map(([bank, total]) => ({ bank, total }))
      .sort((a, b) => b.total - a.total)
  }, [slips])

  return { months, totalAllTime, currentMonth, topBanks }
}
