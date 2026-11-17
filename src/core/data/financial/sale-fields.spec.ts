import {
  financialMovementSchema,
  registerMovementSchema,
  updateMovementSchema,
  MovementChannel,
  MovementDirection,
  MovementOrigin,
  MovementStatus,
  PaymentMethod,
  SALES_CHANNELS,
  SALE_TIME_PATTERN,
  SALES_COUNT_MAX,
} from './financial-movement-schema'
import * as financial from './index'
import { FinancialAccountType } from './financial-account-schema'
import { CategoryType } from './financial-category-schema'

// S3.4: canal Encomendas, hora da venda e número de vendas do lançamento.

const audit = {
  createdAt: new Date('2026-11-17T00:00:00.000Z'),
  createdBy: 'u1',
  updatedAt: new Date('2026-11-17T00:00:00.000Z'),
  updatedBy: 'u1',
}

const entrada = () => ({
  restaurantId: 'r1',
  direction: MovementDirection.In,
  title: 'Encomenda bolo',
  status: MovementStatus.Settled,
  date: new Date('2026-11-17T12:00:00.000Z'),
  grossValue: 180,
  feeValue: 0,
  netValue: 180,
  account: { _id: 'a1', name: 'Caixa', type: FinancialAccountType.Cash },
  category: { _id: 'c1', name: 'Vendas', type: CategoryType.Revenue },
  paymentMethod: PaymentMethod.Pix,
  origin: MovementOrigin.Manual,
  audit,
})

const registro = () => ({
  direction: MovementDirection.In,
  title: 'Fechamento do balcão',
  grossValue: 1500,
  date: '2026-11-17',
  accountId: 'a1',
  categoryId: 'c1',
  paymentMethod: PaymentMethod.Pix,
})

describe('canal Encomendas (S3.4)', () => {
  it('existe no enum e entra nos canais de venda, sem o shared', () => {
    expect(MovementChannel.Orders).toBe('orders')
    expect([...SALES_CHANNELS]).toEqual([
      MovementChannel.DineIn,
      MovementChannel.Delivery,
      MovementChannel.Orders,
    ])
  })

  it('é aceito no lançamento, no registro e na edição', () => {
    expect(
      financialMovementSchema.safeParse({
        ...entrada(),
        channel: MovementChannel.Orders,
      }).success,
    ).toBe(true)
    expect(
      registerMovementSchema.safeParse({
        ...registro(),
        channel: MovementChannel.Orders,
      }).success,
    ).toBe(true)
    expect(
      updateMovementSchema.safeParse({ channel: MovementChannel.Orders })
        .success,
    ).toBe(true)
  })
})

describe('hora da venda (S3.4)', () => {
  it('aceita HH:MM de 00:00 a 23:59', () => {
    for (const t of ['00:00', '09:05', '12:30', '23:59']) {
      expect(SALE_TIME_PATTERN.test(t)).toBe(true)
      expect(
        registerMovementSchema.safeParse({ ...registro(), saleTime: t })
          .success,
      ).toBe(true)
    }
  })

  it('recusa hora fora do formato ou do dia', () => {
    for (const t of ['24:00', '9:05', '12:60', '12h30', '1230', '']) {
      expect(SALE_TIME_PATTERN.test(t)).toBe(false)
      expect(
        registerMovementSchema.safeParse({ ...registro(), saleTime: t })
          .success,
      ).toBe(false)
      expect(updateMovementSchema.safeParse({ saleTime: t }).success).toBe(
        false,
      )
    }
  })

  it('fica guardada na entrada e é opcional (dado antigo continua válido)', () => {
    expect(
      financialMovementSchema.safeParse({ ...entrada(), saleTime: '15:40' })
        .success,
    ).toBe(true)
    expect(financialMovementSchema.safeParse(entrada()).success).toBe(true)
  })
})

describe('número de vendas do lançamento (S3.4)', () => {
  it('aceita inteiro de 1 ao máximo', () => {
    for (const n of [1, 42, SALES_COUNT_MAX]) {
      expect(
        registerMovementSchema.safeParse({ ...registro(), salesCount: n })
          .success,
      ).toBe(true)
      expect(updateMovementSchema.safeParse({ salesCount: n }).success).toBe(
        true,
      )
    }
    expect(
      financialMovementSchema.safeParse({ ...entrada(), salesCount: 42 })
        .success,
    ).toBe(true)
  })

  it('recusa zero, negativo, fração e acima do máximo', () => {
    for (const n of [0, -1, 1.5, SALES_COUNT_MAX + 1]) {
      expect(
        registerMovementSchema.safeParse({ ...registro(), salesCount: n })
          .success,
      ).toBe(false)
      expect(updateMovementSchema.safeParse({ salesCount: n }).success).toBe(
        false,
      )
    }
  })
})

it('exporta os novos itens pelo índice', () => {
  expect(financial.MovementChannel.Orders).toBe('orders')
  expect(financial.SALES_CHANNELS).toBe(SALES_CHANNELS)
  expect(financial.SALE_TIME_PATTERN).toBe(SALE_TIME_PATTERN)
  expect(financial.SALES_COUNT_MAX).toBe(SALES_COUNT_MAX)
})
