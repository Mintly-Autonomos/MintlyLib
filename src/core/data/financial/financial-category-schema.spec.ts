import { financialCategorySchema, financialCategoryUpdateSchema, financialCategoryInsertSchema, CategoryType, CategoryBehavior, OperationalNature, DreGroup, subcategorySchema, subcategoryInsertSchema, subcategoryUpdateSchema } from './financial-category-schema'
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

describe('dreGroup e mixed (fatia 3)', () => {
  const expense = { ...baseCategory, name: 'CMV/Insumos', type: CategoryType.Expense }

  it('despesa exige dreGroup', () => {
    expect(financialCategorySchema.safeParse(expense).success).toBe(false)
    expect(financialCategorySchema.safeParse({ ...expense, dreGroup: DreGroup.Cmv }).success).toBe(true)
  })

  it('receita não aceita dreGroup', () => {
    expect(financialCategorySchema.safeParse({ ...baseCategory, dreGroup: DreGroup.Opex }).success).toBe(false)
    expect(financialCategorySchema.safeParse(baseCategory).success).toBe(true)
  })

  it('aceita behavior mixed', () => {
    expect(financialCategorySchema.safeParse({ ...expense, dreGroup: DreGroup.Opex, behavior: CategoryBehavior.Mixed }).success).toBe(true)
  })

  it('rejeita dreGroup desconhecido', () => {
    expect(financialCategorySchema.safeParse({ ...expense, dreGroup: 'outro' }).success).toBe(false)
  })

  it('insert e update aceitam dreGroup opcional', () => {
    expect(financialCategoryInsertSchema.safeParse({ name: 'X', type: CategoryType.Expense, behavior: CategoryBehavior.Fixed, operationalNature: OperationalNature.Operational, status: RecordStatus.Active }).success).toBe(true)
    expect(financialCategoryInsertSchema.safeParse({ name: 'X', type: CategoryType.Expense, behavior: CategoryBehavior.Fixed, operationalNature: OperationalNature.Operational, status: RecordStatus.Active, dreGroup: DreGroup.Labor }).success).toBe(true)
    expect(financialCategoryUpdateSchema.safeParse({ dreGroup: DreGroup.Tax }).success).toBe(true)
    expect(financialCategoryUpdateSchema.safeParse({ dreGroup: 'outro' }).success).toBe(false)
  })
})

describe('subcategorias (fatia 5)', () => {
  it('lista padrão vazia; aceita subcategorias válidas', () => {
    const parsed = financialCategorySchema.parse(baseCategory) as any
    expect(parsed.subcategories).toEqual([])
    expect(financialCategorySchema.safeParse({ ...baseCategory, subcategories: [{ _id: 's1', name: 'Frango', status: RecordStatus.Active }] }).success).toBe(true)
  })

  it('subcategoria exige status válido e nome até 60', () => {
    expect(subcategorySchema.safeParse({ _id: 's1', name: 'x'.repeat(61), status: RecordStatus.Active }).success).toBe(false)
    expect(subcategorySchema.safeParse({ _id: 's1', name: 'Frango', status: 'apagada' }).success).toBe(false)
  })

  it('cadastro e edição da categoria não aceitam subcategories', () => {
    const insert = { name: 'X', type: CategoryType.Expense, behavior: CategoryBehavior.Fixed, operationalNature: OperationalNature.Operational, status: RecordStatus.Active }
    expect(financialCategoryInsertSchema.safeParse({ ...insert, subcategories: [] }).success).toBe(false)
    expect(financialCategoryUpdateSchema.safeParse({ subcategories: [] }).success).toBe(false)
  })

  it('schemas do sub-recurso', () => {
    expect(subcategoryInsertSchema.safeParse({ name: 'Óleo' }).success).toBe(true)
    expect(subcategoryInsertSchema.safeParse({}).success).toBe(false)
    expect(subcategoryUpdateSchema.safeParse({ name: 'Óleo de soja' }).success).toBe(true)
    expect(subcategoryUpdateSchema.safeParse({ status: 'inactive' }).success).toBe(false)
  })
})
