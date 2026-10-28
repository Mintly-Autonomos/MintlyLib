import type { RegisterMovementRequest, UpdateMovementRequest } from './financial-movement-response'
import { MovementDirection, PaymentMethod, registerMovementSchema, updateMovementSchema } from './financial-movement-schema'

// ts-jest checa os tipos: se `dueDate` sair das interfaces, este arquivo deixa de compilar.
describe('requests de movimentação aceitam dueDate', () => {
  it('RegisterMovementRequest: dueDate string ou Date', () => {
    const base = {
      direction: MovementDirection.Out,
      title: 'Fornecedor',
      grossValue: 100,
      date: '2026-10-01',
      accountId: 'a1',
      categoryId: 'c1',
      paymentMethod: PaymentMethod.Boleto,
    }
    const comString: RegisterMovementRequest = { ...base, dueDate: '2026-10-15' }
    const comDate: RegisterMovementRequest = { ...base, dueDate: new Date('2026-10-15') }
    expect(comString.dueDate).toBe('2026-10-15')
    expect(comDate.dueDate).toBeInstanceOf(Date)
    expect(registerMovementSchema.safeParse({ ...base, dueDate: '2026-10-15' }).success).toBe(true)
  })

  it('UpdateMovementRequest: dueDate string, Date ou null (limpa)', () => {
    const edit: UpdateMovementRequest = { dueDate: '2026-10-20' }
    const limpa: UpdateMovementRequest = { dueDate: null }
    expect(edit.dueDate).toBe('2026-10-20')
    expect(limpa.dueDate).toBeNull()
    expect(updateMovementSchema.safeParse({ dueDate: '2026-10-20' }).success).toBe(true)
  })
})
