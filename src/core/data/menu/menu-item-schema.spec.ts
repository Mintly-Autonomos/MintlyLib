import {
  menuItemSchema,
  menuItemInsertSchema,
  menuItemUpdateSchema,
  menuItemPriceSchema,
  PRICE_REVIEW_ALERT_DAYS,
  PRICE_REVIEW_INTERVAL_MONTHS,
} from './menu-item-schema'
import { RecordStatus } from '../common/status'

const at = new Date('2026-06-16T00:00:00.000Z')

const baseItem = {
  restaurantId: 'rest-123',
  name: 'Frango Yangnyeom',
  category: 'Frango',
  price: 38,
  status: RecordStatus.Active,
  priceUpdatedAt: at,
  priceReviewedAt: at,
  audit: { createdAt: at, updatedAt: at, createdBy: 'u1', updatedBy: 'u1' },
}

describe('menuItemSchema', () => {
  it('aceita um prato completo', () => {
    expect(menuItemSchema.safeParse(baseItem).success).toBe(true)
  })

  it('categoria é opcional', () => {
    const { category, ...semCategoria } = baseItem
    expect(category).toBe('Frango')
    expect(menuItemSchema.safeParse(semCategoria).success).toBe(true)
  })

  it('rejeita preço negativo e nome acima de 80 caracteres', () => {
    expect(menuItemSchema.safeParse({ ...baseItem, price: -1 }).success).toBe(false)
    expect(menuItemSchema.safeParse({ ...baseItem, name: 'x'.repeat(81) }).success).toBe(false)
  })

  it('coage as datas de string ISO', () => {
    const result = menuItemSchema.safeParse({ ...baseItem, priceReviewedAt: '2026-06-16T00:00:00.000Z' })
    expect(result.success).toBe(true)
  })
})

describe('menuItemInsertSchema', () => {
  it('exige nome e preço; datas, status e restaurante ficam por conta do servidor', () => {
    expect(menuItemInsertSchema.safeParse({ name: 'Soju', price: 25 }).success).toBe(true)
    expect(menuItemInsertSchema.safeParse({ price: 25 }).success).toBe(false)
    expect(menuItemInsertSchema.safeParse({ name: 'Soju' }).success).toBe(false)
  })

  it('não deixa o cliente escolher campos controlados pelo servidor', () => {
    const result = menuItemInsertSchema.safeParse({ name: 'Soju', price: 25, status: 'inactive', restaurantId: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('menuItemUpdateSchema', () => {
  it('só nome/categoria, parciais; preço fica de fora (rota própria)', () => {
    expect(menuItemUpdateSchema.safeParse({ name: 'Novo' }).success).toBe(true)
    expect(menuItemUpdateSchema.safeParse({}).success).toBe(true)
    expect(menuItemUpdateSchema.safeParse({ price: 10 }).success).toBe(false)
  })
})

describe('menuItemPriceSchema', () => {
  it('exige preço não negativo', () => {
    expect(menuItemPriceSchema.safeParse({ price: 0 }).success).toBe(true)
    expect(menuItemPriceSchema.safeParse({ price: 41.5 }).success).toBe(true)
    expect(menuItemPriceSchema.safeParse({ price: -1 }).success).toBe(false)
    expect(menuItemPriceSchema.safeParse({}).success).toBe(false)
  })
})

describe('constantes de revisão de preço', () => {
  it('avisa aos ~5,5 meses de um intervalo recomendado de 6', () => {
    expect(PRICE_REVIEW_INTERVAL_MONTHS).toBe(6)
    expect(PRICE_REVIEW_ALERT_DAYS).toBeGreaterThan(5 * 30)
    expect(PRICE_REVIEW_ALERT_DAYS).toBeLessThan(6 * 30.5)
  })
})
