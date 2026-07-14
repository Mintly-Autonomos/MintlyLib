import {
  financialMovementSchema,
  registerMovementSchema,
  MovementDirection,
  MovementStatus,
  MovementStatusSource,
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
// Função (não const) para que cada teste receba uma cópia própria e possa
// espalhar/sobrescrever campos sem afetar os demais testes.
function validInMovement () {
  return {
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
}

// Corpo válido de registro (POST /financial-movements) — usa accountId/categoryId,
// não os snapshots (essa resolução é feita pelo servidor).
function validRegisterBody () {
  return {
    direction: MovementDirection.In,
    title: 'Venda balcão',
    grossValue: 100,
    date: new Date('2026-06-16T00:00:00.000Z'),
    accountId: 'acc-1',
    categoryId: 'cat-1',
    paymentMethod: PaymentMethod.Cash,
  }
}

describe('financialMovementSchema', () => {
  it('1. Deve APROVAR uma entrada (in) com categoria de receita', () => {
    const result = financialMovementSchema.safeParse(validInMovement())

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('2. Deve APROVAR uma saída (out) com categoria de despesa', () => {
    const result = financialMovementSchema.safeParse({
      ...validInMovement(),
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
      ...validInMovement(),
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
      ...validInMovement(),
      date: '2026-06-16T00:00:00.000Z',
    })

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('5. Deve REJEITAR entrada (in) com categoria de despesa (condicional por direção)', () => {
    const result = financialMovementSchema.safeParse({
      ...validInMovement(),
      category: { _id: 'cat-2', name: 'Fornecedores', type: CategoryType.Expense },
    })

    expect(result.success).toBe(false)
  })

  it('6. Deve REJEITAR saída (out) com categoria de receita (condicional por direção)', () => {
    const result = financialMovementSchema.safeParse({
      ...validInMovement(),
      direction: MovementDirection.Out,
      category: { _id: 'cat-1', name: 'Vendas', type: CategoryType.Revenue },
    })

    expect(result.success).toBe(false)
  })

  it('7. Deve REJEITAR grossValue igual a zero (deve ser > 0)', () => {
    const result = financialMovementSchema.safeParse({
      ...validInMovement(),
      grossValue: 0,
      netValue: 0,
    })

    expect(result.success).toBe(false)
  })

  it('8. Deve REJEITAR title acima de 120 caracteres', () => {
    const result = financialMovementSchema.safeParse({
      ...validInMovement(),
      title: 'a'.repeat(121),
    })

    expect(result.success).toBe(false)
  })
})

describe('statusSource (P1 - liquidação automática)', () => {
  it('aceita statusSource auto', () => {
    const doc = { ...validInMovement(), statusSource: MovementStatusSource.Auto }
    expect(financialMovementSchema.safeParse(doc).success).toBe(true)
  })

  it('aceita statusSource manual', () => {
    const doc = { ...validInMovement(), statusSource: MovementStatusSource.Manual }
    expect(financialMovementSchema.safeParse(doc).success).toBe(true)
  })

  it('aceita movimento sem statusSource (docs antigos - ausente vale como auto)', () => {
    const doc = validInMovement()
    expect(financialMovementSchema.safeParse(doc).success).toBe(true)
  })

  it('rejeita statusSource desconhecido', () => {
    const doc = { ...validInMovement(), statusSource: 'robot' }
    expect(financialMovementSchema.safeParse(doc).success).toBe(false)
  })

  it('rejeita statusSource no payload de registro (campo do servidor)', () => {
    const body = { ...validRegisterBody(), statusSource: MovementStatusSource.Manual }
    expect(registerMovementSchema.safeParse(body).success).toBe(false)
  })
})
