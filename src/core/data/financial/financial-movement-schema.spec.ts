import {
  financialMovementSchema,
  MovementDirection,
  MovementStatus,
  PaymentMethod,
  MovementOrigin,
} from './financial-movement-schema'
import { FinancialAccountType } from './financial-account-schema'
import { CategoryType } from './financial-category-schema'

// audit/history/predictedReceiptDate são preenchidos pelo sistema com Date real.
const mockAudit = {
  createdAt: new Date('2026-06-16T00:00:00.000Z'),
  createdBy: 'user-test-123',
  updatedAt: new Date('2026-06-16T00:00:00.000Z'),
  updatedBy: 'user-test-123',
}

// Base válida de uma ENTRADA (in) — os testes derivam variações a partir daqui.
const baseInput = {
  restaurantId: 'rest-123',
  direction: MovementDirection.In,
  title: 'Venda balcão',
  status: MovementStatus.Settled,
  date: new Date('2026-06-16T00:00:00.000Z'),
  grossValue: 100,
  feeValue: 0,
  netValue: 100,
  account: { _id: 'acc-1', name: 'Caixa', type: FinancialAccountType.Cash },
  category: { _id: 'cat-1', name: 'Vendas', type: CategoryType.Revenue },
  paymentMethod: PaymentMethod.Cash,
  origin: MovementOrigin.Manual,
  audit: mockAudit,
}

describe('financialMovementSchema', () => {
  it('1. Deve APROVAR uma entrada (in) com categoria de receita', () => {
    const result = financialMovementSchema.safeParse(baseInput)

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('2. Deve APROVAR uma saída (out) com categoria de despesa', () => {
    const result = financialMovementSchema.safeParse({
      ...baseInput,
      direction: MovementDirection.Out,
      title: 'Compra de insumos',
      category: { _id: 'cat-2', name: 'Fornecedores', type: CategoryType.Expense },
      paymentMethod: PaymentMethod.Pix,
    })

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('3. Deve APROVAR uma entrada platform com snapshot de taxa, contraparte e prazo', () => {
    const result = financialMovementSchema.safeParse({
      ...baseInput,
      status: MovementStatus.Pending,
      grossValue: 100,
      feeValue: 12,
      netValue: 88,
      feePercentApplied: 12,
      settlementDaysApplied: 30,
      predictedReceiptDate: new Date('2026-07-16T00:00:00.000Z'),
      account: { _id: 'acc-2', name: 'iFood', type: FinancialAccountType.Platform },
      counterparty: { name: 'Cliente X', kind: 'client', refId: 'p-1' },
      description: 'Pedido via app',
    })

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('4. Deve aceitar `date` como ISO string (coerção p/ Date)', () => {
    const result = financialMovementSchema.safeParse({
      ...baseInput,
      date: '2026-06-16T00:00:00.000Z',
    })

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('5. Deve REJEITAR entrada (in) com categoria de despesa (condicional por direção)', () => {
    const result = financialMovementSchema.safeParse({
      ...baseInput,
      category: { _id: 'cat-2', name: 'Fornecedores', type: CategoryType.Expense },
    })

    expect(result.success).toBe(false)
  })

  it('6. Deve REJEITAR saída (out) com categoria de receita (condicional por direção)', () => {
    const result = financialMovementSchema.safeParse({
      ...baseInput,
      direction: MovementDirection.Out,
      category: { _id: 'cat-1', name: 'Vendas', type: CategoryType.Revenue },
    })

    expect(result.success).toBe(false)
  })

  it('7. Deve REJEITAR grossValue igual a zero (deve ser > 0)', () => {
    const result = financialMovementSchema.safeParse({
      ...baseInput,
      grossValue: 0,
      netValue: 0,
    })

    expect(result.success).toBe(false)
  })

  it('8. Deve REJEITAR title acima de 120 caracteres', () => {
    const result = financialMovementSchema.safeParse({
      ...baseInput,
      title: 'a'.repeat(121),
    })

    expect(result.success).toBe(false)
  })
})
