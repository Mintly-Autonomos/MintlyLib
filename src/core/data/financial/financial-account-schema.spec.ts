import { financialAccountSchema, financialAccountUpdateSchema, FinancialAccountType } from './financial-account-schema'
import { RecordStatus } from '../common/status'

const mockAudit = {
  createdAt: new Date('2026-06-16T00:00:00.000Z'),
  createdBy: 'user-test-123',
  updatedAt: new Date('2026-06-16T00:00:00.000Z'),
  updatedBy: 'user-test-123',
}

describe('financialAccountSchema', () => {
  it('1. Deve APROVAR uma conta padrão (bank) sem taxas', () => {
    const result = financialAccountSchema.safeParse({
      restaurantId: 'rest-123',
      name: 'Conta Nubank',
      type: FinancialAccountType.Bank,
      status: RecordStatus.Active,
      isDefault: true,
      audit: mockAudit,
      // Não enviamos taxas aqui, o que é o correto para bank!
    })

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('2. Deve APROVAR uma conta plataforma COM as taxas obrigatórias', () => {
    const result = financialAccountSchema.safeParse({
      restaurantId: 'rest-123',
      name: 'iFood',
      type: FinancialAccountType.Platform,
      status: RecordStatus.Active,
      isDefault: false,
      feePercent: 12, // Taxa enviada
      settlementDays: 30, // Prazo enviado
      audit: mockAudit,
    })

    if (!result.success) {
      console.log(result.error.flatten())
    }

    expect(result.success).toBe(true)
  })

  it('3. Deve REJEITAR uma conta plataforma SEM as taxas (Nossa Validação Condicional)', () => {
    const result = financialAccountSchema.safeParse({
      restaurantId: 'rest-123',
      name: 'iFood Quebrado',
      type: FinancialAccountType.Platform,
      status: RecordStatus.Active,
      isDefault: false,
      audit: mockAudit,
      // Esquecemos de enviar as taxas de propósito!
    })

    expect(result.success).toBe(false)
  })

  it('4. Deve REJEITAR uma conta padrão (bank) que tente enviar taxas', () => {
    const result = financialAccountSchema.safeParse({
      restaurantId: 'rest-123',
      name: 'Conta Hackeada',
      type: FinancialAccountType.Bank,
      status: RecordStatus.Active,
      isDefault: false,
      feePercent: 5, // Não deveria existir!
      settlementDays: 2, // Não deveria existir!
      audit: mockAudit,
    })

    expect(result.success).toBe(false)
  })

  const platformAccount = (feePercent: number) => ({
    restaurantId: 'rest-123',
    name: 'iFood',
    type: FinancialAccountType.Platform,
    status: RecordStatus.Active,
    isDefault: false,
    feePercent,
    settlementDays: 30,
    audit: mockAudit,
  })

  it('5. Deve APROVAR feePercent fracionário (ex.: 12.5%)', () => {
    expect(financialAccountSchema.safeParse(platformAccount(12.5)).success).toBe(true)
    expect(financialAccountSchema.safeParse(platformAccount(3.99)).success).toBe(true)
  })

  it('6. Deve REJEITAR feePercent acima de 100', () => {
    expect(financialAccountSchema.safeParse(platformAccount(150)).success).toBe(false)
  })
})

describe('financialAccountUpdateSchema — type imutável (P5)', () => {
  it('rejeita PATCH com type (o tipo da conta é imutável)', () => {
    const result = financialAccountUpdateSchema.safeParse({ type: 'platform' })
    expect(result.success).toBe(false)
  })

  it('continua aceitando PATCH de name', () => {
    expect(financialAccountUpdateSchema.safeParse({ name: 'Caixa novo' }).success).toBe(true)
  })

  it('continua aceitando PATCH de feePercent (a coerência com o tipo é validada na API)', () => {
    expect(financialAccountUpdateSchema.safeParse({ feePercent: 15 }).success).toBe(true)
  })
})

describe('conta plataforma com regra de repasse', () => {
  const base = {
    restaurantId: 'rest-123',
    name: 'iFood',
    type: FinancialAccountType.Platform,
    status: RecordStatus.Active,
    isDefault: false,
    feePercent: 12,
    audit: mockAudit,
  }

  it('aceita só settlementRule (repasse toda quarta), sem settlementDays', () => {
    const result = financialAccountSchema.safeParse({
      ...base,
      settlementRule: { kind: 'weekly', weekday: 3 },
    })
    expect(result.success).toBe(true)
  })

  it('conta antiga, só com settlementDays, continua válida', () => {
    expect(financialAccountSchema.safeParse({ ...base, settlementDays: 7 }).success).toBe(true)
  })

  it('recusa regra malformada', () => {
    const result = financialAccountSchema.safeParse({
      ...base,
      settlementRule: { kind: 'weekly', weekday: 9 },
    })
    expect(result.success).toBe(false)
  })

  it('conta que não é plataforma continua recusando regra de repasse', () => {
    const result = financialAccountSchema.safeParse({
      restaurantId: 'rest-123',
      name: 'Caixa',
      type: FinancialAccountType.Cash,
      status: RecordStatus.Active,
      isDefault: false,
      settlementRule: { kind: 'weekly', weekday: 3 },
      audit: mockAudit,
    })
    expect(result.success).toBe(false)
  })

  it('o PATCH aceita trocar só a regra', () => {
    expect(
      financialAccountUpdateSchema.safeParse({ settlementRule: { kind: 'monthly', day: 10 } }).success,
    ).toBe(true)
  })
})
