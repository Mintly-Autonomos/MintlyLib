import { financialAccountInsertSchema, financialAccountSchema, financialAccountUpdateSchema, FinancialAccountType } from './financial-account-schema'
import { PaymentMethod } from './financial-movement-schema'
import { FEE_PAYMENT_METHODS, platformFeePercent, platformKindOf } from './platform-fee'
import { PlatformKind } from './platform-kind'
import { RecordStatus } from '../common/status'
import * as lib from '../../../index'

const audit = {
  createdAt: new Date('2026-06-16T00:00:00.000Z'),
  createdBy: 'u',
  updatedAt: new Date('2026-06-16T00:00:00.000Z'),
  updatedBy: 'u',
}
const maquininha = {
  restaurantId: 'r',
  name: 'Stone',
  type: FinancialAccountType.Platform,
  status: RecordStatus.Active,
  isDefault: false,
  audit,
  feePercent: 2.5,
  settlementDays: 1,
  platformKind: PlatformKind.CardMachine,
  feeByMethod: { debit: 1.2, credit: 3.1, pix: 0.8 },
}

describe('maquininha e taxa por forma de pagamento (relatório S3.3)', () => {
  it('conta plataforma aceita o tipo e a taxa por forma', () => {
    expect(financialAccountSchema.safeParse(maquininha).success).toBe(true)
    const { restaurantId: _r, isDefault: _d, audit: _a, ...insert } = maquininha
    expect(financialAccountInsertSchema.safeParse(insert).success).toBe(true)
  })

  it('conta antiga, sem tipo nem taxa por forma, continua válida', () => {
    const { platformKind: _k, feeByMethod: _f, ...antiga } = maquininha
    expect(financialAccountSchema.safeParse(antiga).success).toBe(true)
  })

  it('recusa tipo desconhecido, taxa fora de 0..100 e forma que não existe', () => {
    expect(financialAccountSchema.safeParse({ ...maquininha, platformKind: 'banco' }).success).toBe(false)
    expect(financialAccountSchema.safeParse({ ...maquininha, feeByMethod: { credit: 120 } }).success).toBe(false)
    expect(financialAccountSchema.safeParse({ ...maquininha, feeByMethod: { boleto: 2 } }).success).toBe(false)
  })

  it('conta que não é plataforma não aceita os campos', () => {
    const banco = { restaurantId: 'r', name: 'Nubank', type: FinancialAccountType.Bank, status: RecordStatus.Active, isDefault: true, audit }
    expect(financialAccountSchema.safeParse({ ...banco, platformKind: PlatformKind.CardMachine }).success).toBe(false)
    expect(financialAccountSchema.safeParse({ ...banco, feeByMethod: { debit: 1 } }).success).toBe(false)
  })

  it('o PATCH aceita trocar o tipo da plataforma e a taxa por forma', () => {
    expect(financialAccountUpdateSchema.safeParse({ platformKind: PlatformKind.Marketplace, feeByMethod: {} }).success).toBe(true)
    expect(financialAccountUpdateSchema.safeParse({ feeByMethod: { pix: -1 } }).success).toBe(false)
  })

  it('platformFeePercent: a taxa da forma, senão a da conta; fora de plataforma, nenhuma', () => {
    expect(platformFeePercent(maquininha, PaymentMethod.Credit)).toBe(3.1)
    expect(platformFeePercent(maquininha, PaymentMethod.Pix)).toBe(0.8)
    expect(platformFeePercent(maquininha, PaymentMethod.DigitalWallet)).toBe(2.5)
    expect(platformFeePercent(maquininha, null)).toBe(2.5)
    expect(platformFeePercent({ ...maquininha, feeByMethod: { pix: 0 } }, PaymentMethod.Pix)).toBe(0)
    expect(platformFeePercent({ type: FinancialAccountType.Bank }, PaymentMethod.Credit)).toBeUndefined()
  })

  it('platformKindOf: sem o campo é app de delivery; fora de plataforma é null', () => {
    expect(platformKindOf(maquininha)).toBe(PlatformKind.CardMachine)
    expect(platformKindOf({ type: FinancialAccountType.Platform })).toBe(PlatformKind.Marketplace)
    expect(platformKindOf({ type: FinancialAccountType.Cash })).toBeNull()
  })

  it('é exportado pelo pacote', () => {
    expect(lib.PlatformKind.CardMachine).toBe('cardMachine')
    expect(lib.platformFeePercent).toBe(platformFeePercent)
    expect(lib.FEE_PAYMENT_METHODS).toEqual(FEE_PAYMENT_METHODS)
    expect(FEE_PAYMENT_METHODS).toEqual(['debit', 'credit', 'pix', 'digitalWallet'])
  })
})
