import { parseSlipText } from '../../lib/slipParser'

describe('parseSlipText', () => {
  it('extracts THB amount from standard format', () => {
    const raw = `KBank ธนาคารกสิกรไทย
จำนวน 1,500.00 บาท
ผู้รับ นายสมชาย ใจดี
วันที่ 01/05/2568
Ref: TXN20240501001`
    const result = parseSlipText(raw)
    expect(result.data?.amount).toBe(1500)
    expect(result.data?.recipientBank).toBe('KBANK')
    expect(result.data?.recipientName).toContain('นายสมชาย')
    expect(result.errors).not.toContain('amount')
  })

  it('extracts amount with ฿ symbol', () => {
    const raw = `SCB ไทยพาณิชย์\n฿2,350.50\nผู้รับ จงรัก`
    const result = parseSlipText(raw)
    expect(result.data?.amount).toBe(2350.5)
    expect(result.data?.recipientBank).toBe('SCB')
  })

  it('detects PromptPay', () => {
    const raw = `พร้อมเพย์\nจำนวน 500.00 บาท\nผู้รับ ร้านกาแฟ`
    const result = parseSlipText(raw)
    expect(result.data?.recipientBank).toBe('PROMPTPAY')
  })

  it('converts Buddhist Era date to CE', () => {
    const raw = `KTB กรุงไทย\nจำนวน 100.00 บาท\nวันที่ 15/03/2567\nผู้รับ TEST`
    const result = parseSlipText(raw)
    // 2567 BE = 2024 CE
    expect(result.data?.transactionDate).toContain('2024')
  })

  it('returns errors array for missing fields', () => {
    const raw = `some random text without slip data`
    const result = parseSlipText(raw)
    expect(result.success).toBe(false)
    expect(result.errors).toContain('amount')
  })

  it('extracts reference number', () => {
    const raw = `KBank\nจำนวน 200.00 บาท\nผู้รับ TEST\nRef: ABC1234567890`
    const result = parseSlipText(raw)
    expect(result.data?.referenceNumber).toBe('ABC1234567890')
  })

  it('extracts time', () => {
    const raw = `SCB\nจำนวน 100.00 บาท\nผู้รับ TEST\n14:32:05`
    const result = parseSlipText(raw)
    expect(result.data?.transactionTime).toBe('14:32:05')
  })
})
