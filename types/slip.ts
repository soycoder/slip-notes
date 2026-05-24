export type BankCode =
  | 'KBANK'
  | 'SCB'
  | 'KTB'
  | 'BBL'
  | 'BAY'
  | 'TTB'
  | 'GSB'
  | 'PROMPTPAY'
  | 'TRUEMONEY'
  | 'UNKNOWN'

export interface SlipData {
  amount: number
  currency: 'THB'
  recipientName: string
  recipientBank: BankCode
  senderBank: BankCode
  transactionDate: string
  transactionTime: string | null
  referenceNumber: string | null
  rawOcrText: string
  confidence: number
  parsedAt: string
}

export interface ParsedSlip {
  success: boolean
  data: SlipData | null
  errors: string[]
}

export interface ExpenseMonth {
  year: number
  month: number
  totalAmount: number
  slipCount: number
  byBank: Partial<Record<BankCode, number>>
}
