import {
  accountUpdateSchema,
  changeEmailRequestSchema,
  changePasswordRequestSchema,
  deletionRequestSchema,
  memberCreateRequestSchema,
  memberUpdateRequestSchema,
  MemberStatus,
} from './account-schema'
import { restaurantSchema } from '../restaurant/restaurant-schema'

const audit = { createdAt: new Date('2026-10-01T00:00:00.000Z'), updatedAt: new Date('2026-10-01T00:00:00.000Z') }

describe('accountUpdateSchema', () => {
  it('aceita nome e/ou telefone, ambos opcionais', () => {
    expect(accountUpdateSchema.safeParse({}).success).toBe(true)
    expect(accountUpdateSchema.safeParse({ name: 'Davi Lee' }).success).toBe(true)
    expect(accountUpdateSchema.safeParse({ phone: '11999990000' }).success).toBe(true)
  })

  it('rejeita nome curto e telefone curto', () => {
    expect(accountUpdateSchema.safeParse({ name: 'D' }).success).toBe(false)
    expect(accountUpdateSchema.safeParse({ phone: '123' }).success).toBe(false)
  })

  it('é estrito: e-mail, papel e status não passam por aqui', () => {
    expect(accountUpdateSchema.safeParse({ email: 'x@y.com' }).success).toBe(false)
    expect(accountUpdateSchema.safeParse({ role: 'owner' }).success).toBe(false)
    expect(accountUpdateSchema.safeParse({ status: 'active' }).success).toBe(false)
  })
})

describe('changeEmailRequestSchema', () => {
  it('exige e-mail válido e a senha atual', () => {
    expect(changeEmailRequestSchema.safeParse({ email: 'novo@teste.com', currentPassword: 'x' }).success).toBe(true)
    expect(changeEmailRequestSchema.safeParse({ email: 'novo', currentPassword: 'x' }).success).toBe(false)
    expect(changeEmailRequestSchema.safeParse({ email: 'novo@teste.com' }).success).toBe(false)
    expect(changeEmailRequestSchema.safeParse({ email: 'novo@teste.com', currentPassword: '' }).success).toBe(false)
  })
})

describe('changePasswordRequestSchema', () => {
  it('a senha nova segue a política (8+, maiúscula, minúscula e número)', () => {
    expect(changePasswordRequestSchema.safeParse({ currentPassword: 'x', newPassword: 'Nova#12345' }).success).toBe(true)
    expect(changePasswordRequestSchema.safeParse({ currentPassword: 'x', newPassword: 'curta1A' }).success).toBe(false)
    expect(changePasswordRequestSchema.safeParse({ currentPassword: 'x', newPassword: 'semnumeroAAA' }).success).toBe(false)
  })

  it('exige a senha atual', () => {
    expect(changePasswordRequestSchema.safeParse({ newPassword: 'Nova#12345' }).success).toBe(false)
    expect(changePasswordRequestSchema.safeParse({ currentPassword: '', newPassword: 'Nova#12345' }).success).toBe(false)
  })
})

describe('memberCreateRequestSchema', () => {
  it('nome, e-mail e senha forte', () => {
    expect(memberCreateRequestSchema.safeParse({ name: 'Ana', email: 'ana@teste.com', password: 'Senha#12345' }).success).toBe(true)
    expect(memberCreateRequestSchema.safeParse({ name: 'A', email: 'ana@teste.com', password: 'Senha#12345' }).success).toBe(false)
    expect(memberCreateRequestSchema.safeParse({ name: 'Ana', email: 'ana', password: 'Senha#12345' }).success).toBe(false)
    expect(memberCreateRequestSchema.safeParse({ name: 'Ana', email: 'ana@teste.com', password: 'fraca' }).success).toBe(false)
  })

  it('não aceita papel nem restaurante vindo do cliente (o servidor decide)', () => {
    expect(memberCreateRequestSchema.safeParse({ name: 'Ana', email: 'ana@teste.com', password: 'Senha#12345', role: 'owner' }).success).toBe(false)
    expect(memberCreateRequestSchema.safeParse({ name: 'Ana', email: 'ana@teste.com', password: 'Senha#12345', restaurantId: 'x' }).success).toBe(false)
  })
})

describe('memberUpdateRequestSchema', () => {
  it('ativa/inativa e/ou troca a senha; bloqueio não é do dono', () => {
    expect(memberUpdateRequestSchema.safeParse({}).success).toBe(true)
    expect(memberUpdateRequestSchema.safeParse({ status: MemberStatus.Inactive }).success).toBe(true)
    expect(memberUpdateRequestSchema.safeParse({ password: 'Senha#12345' }).success).toBe(true)
    expect(memberUpdateRequestSchema.safeParse({ status: 'blocked' }).success).toBe(false)
    expect(memberUpdateRequestSchema.safeParse({ password: 'fraca' }).success).toBe(false)
    expect(memberUpdateRequestSchema.safeParse({ email: 'x@y.com' }).success).toBe(false)
  })
})

describe('deletionRequestSchema', () => {
  it('exige a senha; o motivo é opcional e limitado', () => {
    expect(deletionRequestSchema.safeParse({ password: 'x' }).success).toBe(true)
    expect(deletionRequestSchema.safeParse({ password: 'x', reason: 'Fechei o restaurante' }).success).toBe(true)
    expect(deletionRequestSchema.safeParse({ password: '' }).success).toBe(false)
    expect(deletionRequestSchema.safeParse({}).success).toBe(false)
    expect(deletionRequestSchema.safeParse({ password: 'x', reason: 'a'.repeat(501) }).success).toBe(false)
  })
})

describe('restaurantSchema.deletionRequestedAt', () => {
  it('é opcional e é uma data', () => {
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit }).success).toBe(true)
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, deletionRequestedAt: new Date('2026-11-03') }).success).toBe(true)
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, deletionRequestedAt: 'ontem' }).success).toBe(false)
  })
})
