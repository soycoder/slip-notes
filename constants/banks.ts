import type { BankCode } from '@/types/slip'

export interface BankInfo {
  code: BankCode
  name: string
  shortName: string
  color: string
  patterns: RegExp[]
}

export const BANKS: Record<BankCode, BankInfo> = {
  KBANK: {
    code: 'KBANK',
    name: 'Kasikorn Bank',
    shortName: 'KBank',
    color: '#138F2D',
    patterns: [/kasikorn/i, /กสิกร/u, /kbank/i, /K\+/],
  },
  SCB: {
    code: 'SCB',
    name: 'Siam Commercial Bank',
    shortName: 'SCB',
    color: '#4E2D8A',
    patterns: [/siam commercial/i, /ไทยพาณิชย์/u, /\bscb\b/i],
  },
  KTB: {
    code: 'KTB',
    name: 'Krungthai Bank',
    shortName: 'KTB',
    color: '#009FD4',
    patterns: [/krungthai/i, /กรุงไทย/u, /\bktb\b/i],
  },
  BBL: {
    code: 'BBL',
    name: 'Bangkok Bank',
    shortName: 'BBL',
    color: '#1B3A8E',
    patterns: [/bangkok bank/i, /กรุงเทพ/u, /\bbbl\b/i],
  },
  BAY: {
    code: 'BAY',
    name: 'Bank of Ayudhya (Krungsri)',
    shortName: 'Krungsri',
    color: '#FEC100',
    patterns: [/krungsri/i, /กรุงศรี/u, /\bbay\b/i, /ayudhya/i],
  },
  TTB: {
    code: 'TTB',
    name: 'TMBThanachart',
    shortName: 'ttb',
    color: '#0070BA',
    patterns: [/\btmb\b/i, /thanachart/i, /ทหารไทย/u, /\bttb\b/i],
  },
  GSB: {
    code: 'GSB',
    name: 'Government Savings Bank',
    shortName: 'GSB',
    color: '#FF69B4',
    patterns: [/government savings/i, /ออมสิน/u, /\bgsb\b/i],
  },
  PROMPTPAY: {
    code: 'PROMPTPAY',
    name: 'PromptPay',
    shortName: 'PromptPay',
    color: '#003F87',
    patterns: [/พร้อมเพย์/u, /promptpay/i, /prompt pay/i],
  },
  TRUEMONEY: {
    code: 'TRUEMONEY',
    name: 'TrueMoney Wallet',
    shortName: 'TrueMoney',
    color: '#FF6600',
    patterns: [/truemoney/i, /true money/i, /ทรูมันนี่/u],
  },
  UNKNOWN: {
    code: 'UNKNOWN',
    name: 'Unknown Bank',
    shortName: 'Unknown',
    color: '#9CA3AF',
    patterns: [],
  },
}

export function detectBank(text: string): BankCode {
  for (const [code, info] of Object.entries(BANKS)) {
    if (code === 'UNKNOWN') continue
    if (info.patterns.some((p) => p.test(text))) return code as BankCode
  }
  return 'UNKNOWN'
}
