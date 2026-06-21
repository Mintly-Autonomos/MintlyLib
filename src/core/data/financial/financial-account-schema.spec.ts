import { financialAccountSchema, FinancialAccountType } from './financial-account-schema'
import { RecordStatus } from '../common/status'

const mockAudit = {
  createdAt: '2026-06-16T00:00:00.000Z',
  createdBy: 'user-test-123',
  updatedAt: '2026-06-16T00:00:00.000Z',
  updatedBy: 'user-test-123'
}

describe('financialAccountSchema', () => {
  
  it('1. Deve APROVAR uma conta padrão (bank) sem taxas', () => {
    const result = financialAccountSchema.safeParse({
      restaurantId: 'rest-123',
      name: 'Conta Nubank',
      type: FinancialAccountType.Bank,
      status: RecordStatus.Active,
      isDefault: true,
      audit:mockAudit
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
      feePercent: 12,       // Taxa enviada
      settlementDays: 30,   // Prazo enviado
      audit:mockAudit
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
      audit:mockAudit
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
      feePercent: 5,     // Não deveria existir!
      settlementDays: 2, // Não deveria existir!
      audit:mockAudit
    })

    expect(result.success).toBe(false)
  })

})