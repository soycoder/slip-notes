import type { BankCode, ParsedSlip, SlipData } from '@/types/slip'
import { detectBank } from '@/constants/banks'

const THAI_MONTHS: Record<string, number> = {
  'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4,
  'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8,
  'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12,
  'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4,
  'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8,
  'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12,
}

export function parseSlipText(rawText: string): ParsedSlip {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean)
  const joined = lines.join(' ')

  const amount = extractAmount(lines)
  const recipientBank = detectBank(joined)
  const senderBank = detectSenderBank(joined, recipientBank)
  const recipientName = extractRecipientName(lines)
  const transactionDate = extractDate(joined) ?? new Date().toISOString()
  const transactionTime = extractTime(joined)
  const referenceNumber = extractReference(lines)

  const errors: string[] = []
  if (amount === null) errors.push('amount')
  if (!recipientName) errors.push('recipientName')
  if (recipientBank === 'UNKNOWN') errors.push('recipientBank')

  return {
    success: errors.length === 0,
    data: {
      amount: amount ?? 0,
      currency: 'THB',
      recipientName: recipientName ?? '',
      recipientBank,
      senderBank,
      transactionDate,
      transactionTime,
      referenceNumber,
      rawOcrText: rawText,
      confidence: 0,
      parsedAt: new Date().toISOString(),
    },
    errors,
  }
}

function extractAmount(lines: string[]): number | null {
  const patterns = [
    /(?:จำนวน|amount)[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /([0-9,]+(?:\.[0-9]{2}))\s*(?:บาท|THB|฿)/i,
    /฿\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
  ]
  for (const line of lines) {
    for (const pattern of patterns) {
      const m = line.match(pattern)
      if (m) {
        const n = parseFloat(m[1].replace(/,/g, ''))
        if (!isNaN(n) && n > 0) return n
      }
    }
  }
  return null
}

function detectSenderBank(text: string, recipientBank: BankCode): BankCode {
  // Look for "from" / "จาก" context clues
  const fromMatch = text.match(/(?:จาก|from|sender)[:\s]+(.{5,40})/i)
  if (fromMatch) {
    const detected = detectBank(fromMatch[1])
    if (detected !== 'UNKNOWN') return detected
  }
  return recipientBank === 'UNKNOWN' ? 'UNKNOWN' : 'UNKNOWN'
}

function extractRecipientName(lines: string[]): string | null {
  const keywords = ['ผู้รับ', 'ปลายทาง', 'recipient', 'to:', 'ถึง']
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase()
    if (keywords.some((k) => lines[i].includes(k) || lower.includes(k))) {
      const candidate = lines[i]
        .replace(/(?:ผู้รับ|ปลายทาง|recipient|to:|ถึง)[:\s]*/i, '')
        .trim()
      if (candidate.length > 1) return candidate
      if (lines[i + 1]) return lines[i + 1].trim()
    }
  }
  return null
}

function extractDate(text: string): string | null {
  // ISO-like: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (dmyMatch) {
    let [, d, m, y] = dmyMatch
    let year = parseInt(y)
    if (year > 2400) year -= 543  // Buddhist Era conversion
    if (year < 100) year += 2000
    const date = new Date(year, parseInt(m) - 1, parseInt(d))
    if (!isNaN(date.getTime())) return date.toISOString()
  }

  // Thai month name: "1 มกราคม 2568"
  for (const [monthName, monthNum] of Object.entries(THAI_MONTHS)) {
    const pattern = new RegExp(`(\\d{1,2})\\s+${monthName}\\s+(\\d{4})`)
    const m = text.match(pattern)
    if (m) {
      let year = parseInt(m[2])
      if (year > 2400) year -= 543
      const date = new Date(year, monthNum - 1, parseInt(m[1]))
      if (!isNaN(date.getTime())) return date.toISOString()
    }
  }

  return null
}

function extractTime(text: string): string | null {
  const m = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (m) return m[0]
  return null
}

function extractReference(lines: string[]): string | null {
  const patterns = [
    /(?:ref|อ้างอิง|หมายเลข|transaction)[.:\s#]*([A-Z0-9]{8,})/i,
    /([A-Z]{2,}\d{8,})/,
  ]
  for (const line of lines) {
    for (const pattern of patterns) {
      const m = line.match(pattern)
      if (m) return m[1]
    }
  }
  // Last resort: last long digit-only sequence
  const allNums = lines.join(' ').match(/\b\d{10,}\b/g)
  return allNums ? allNums[allNums.length - 1] : null
}
