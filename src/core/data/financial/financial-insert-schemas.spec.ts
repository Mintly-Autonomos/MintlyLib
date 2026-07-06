import { financialCategoryInsertSchema } from './financial-category-schema'
import { financialAccountInsertSchema } from './financial-account-schema'
import {
  registerMovementSchema,
  changeMovementStatusSchema,
  recomputeBalancesSchema,
} from './financial-movement-schema'

describe('financialCategoryInsertSchema', () => {
  const base = {
    name: 'Venda Balcão',
    type: 'revenue',
    behavior: 'variable',
    operationalNature: 'operational',
    status: 'active',
  }

  it('APROVA sem audit (o servidor preenche) — resolve o VALIDATION_ERROR', () => {
    expect(financialCategoryInsertSchema.safeParse(base).success).toBe(true)
  })

  it('APROVA ainda enviando audit/restaurantId (compat com client atual)', () => {
    const result = financialCategoryInsertSchema.safeParse({
      ...base,
      restaurantId: 'rest-1',
      audit: { createdAt: new Date(), updatedAt: new Date() },
    })
    expect(result.success).toBe(true)
  })

  it('REJEITA sem os campos obrigatórios do usuário (name)', () => {
    const { name, ...withoutName } = base
    expect(financialCategoryInsertSchema.safeParse(withoutName).success).toBe(false)
  })
})

describe('financialAccountInsertSchema', () => {
  it('APROVA conta padrão (bank) sem audit', () => {
    const result = financialAccountInsertSchema.safeParse({
      name: 'Itaú PJ',
      type: 'bank',
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  it('APROVA conta platform com fee/settlement, sem audit', () => {
    const result = financialAccountInsertSchema.safeParse({
      name: 'iFood',
      type: 'platform',
      status: 'active',
      feePercent: 12,
      settlementDays: 14,
    })
    expect(result.success).toBe(true)
  })

  it('REJEITA fee/settlement em conta não-platform (união discriminada)', () => {
    const result = financialAccountInsertSchema.safeParse({
      name: 'Caixa',
      type: 'cash',
      status: 'active',
      feePercent: 5,
    })
    expect(result.success).toBe(false)
  })
})

describe('registerMovementSchema', () => {
  const base = {
    direction: 'in',
    title: 'Venda',
    grossValue: 100,
    date: '2026-07-05T00:00:00.000Z',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    paymentMethod: 'pix',
  }

  it('APROVA um registro com accountId/categoryId (não snapshot) e coage a data', () => {
    const result = registerMovementSchema.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.date instanceof Date).toBe(true)
  })

  it('REJEITA sem accountId', () => {
    const { accountId, ...withoutAccount } = base
    expect(registerMovementSchema.safeParse(withoutAccount).success).toBe(false)
  })

  it('REJEITA grossValue <= 0', () => {
    expect(registerMovementSchema.safeParse({ ...base, grossValue: 0 }).success).toBe(false)
  })
})

describe('changeMovementStatusSchema / recomputeBalancesSchema', () => {
  it('changeStatus exige um status válido', () => {
    expect(changeMovementStatusSchema.safeParse({ status: 'settled' }).success).toBe(true)
    expect(changeMovementStatusSchema.safeParse({ status: 'xpto' }).success).toBe(false)
  })

  it('recompute exige accountId', () => {
    expect(recomputeBalancesSchema.safeParse({ accountId: 'acc-1' }).success).toBe(true)
    expect(recomputeBalancesSchema.safeParse({}).success).toBe(false)
  })
})
