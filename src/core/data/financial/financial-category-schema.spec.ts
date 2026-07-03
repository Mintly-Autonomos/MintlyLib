import { financialCategorySchema, financialCategoryUpdateSchema, CategoryType, CategoryBehavior, OperationalNature } from './financial-category-schema'
import { RecordStatus } from '../common/status'

const mockAudit = {
  createdAt: new Date('2026-06-16T00:00:00.000Z'),
  createdBy: 'user-test-123',
  updatedAt: new Date('2026-06-16T00:00:00.000Z'),
  updatedBy: 'user-test-123',
}

const baseCategory = {
  restaurantId: 'rest-123',
  name: 'Venda Balcão',
  type: CategoryType.Revenue,
  behavior: CategoryBehavior.Variable,
  operationalNature: OperationalNature.Operational,
  status: RecordStatus.Active,
  isSystem: false,
  audit: mockAudit,
}

describe('financialCategorySchema', () => {
  it('1. Deve aplicar usage=0 e history=[] por padrão quando não enviados', () => {
    const result = financialCategorySchema.safeParse(baseCategory)

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.usage).toBe(0)
      expect(result.data.history).toEqual([])
      expect(result.data.lastUsedAt).toBeUndefined()
    }
  })

  it('2. Deve APROVAR quando usage, lastUsedAt e history são enviados explicitamente', () => {
    const result = financialCategorySchema.safeParse({
      ...baseCategory,
      usage: 5,
      lastUsedAt: new Date('2026-07-01T00:00:00.000Z'),
      history: [
        { at: new Date('2026-06-20T00:00:00.000Z'), by: 'user-test-123', action: 'create' },
      ],
    })

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.usage).toBe(5)
      expect(result.data.history).toHaveLength(1)
    }
  })

  it('3. Deve REJEITAR um item de history sem o campo obrigatório action', () => {
    const result = financialCategorySchema.safeParse({
      ...baseCategory,
      history: [
        { at: new Date('2026-06-20T00:00:00.000Z'), by: 'user-test-123' },
      ],
    })

    expect(result.success).toBe(false)
  })
})

describe('financialCategoryUpdateSchema', () => {
  it('4. Deve APROVAR um update parcial só com name', () => {
    const result = financialCategoryUpdateSchema.safeParse({ name: 'Novo nome' })

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('5. Deve REJEITAR tentativa de editar isSystem pelo update schema', () => {
    const result = financialCategoryUpdateSchema.safeParse({ isSystem: true })

    expect(result.success).toBe(false)
  })
})
