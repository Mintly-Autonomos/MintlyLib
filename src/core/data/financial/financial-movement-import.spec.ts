import {
  IMPORT_MOVEMENTS_MAX_ROWS,
  importMovementRowSchema,
  importMovementsSchema,
} from './financial-movement-import'
import { MovementDirection, PaymentMethod } from './financial-movement-schema'

const linha = (row: number, over: Record<string, unknown> = {}) => ({
  row,
  direction: MovementDirection.In,
  title: 'Venda balcão',
  grossValue: 184.5,
  date: '2026-10-28',
  accountId: 'acc1',
  categoryId: 'cat1',
  paymentMethod: PaymentMethod.Pix,
  ...over,
})

describe('importMovementsSchema', () => {
  it('aceita linhas no formato do register + número da linha', () => {
    const r = importMovementsSchema.safeParse({ idempotencyKey: 'abcd1234', rows: [linha(1), linha(2)] })
    expect(r.success).toBe(true)
  })

  it('a chave de idempotência é obrigatória e tem tamanho mínimo e máximo', () => {
    expect(importMovementsSchema.safeParse({ rows: [linha(1)] }).success).toBe(false)
    expect(importMovementsSchema.safeParse({ idempotencyKey: 'curta', rows: [linha(1)] }).success).toBe(false)
    expect(importMovementsSchema.safeParse({ idempotencyKey: 'x'.repeat(129), rows: [linha(1)] }).success).toBe(false)
  })

  it('exige ao menos uma linha e respeita o limite por pedido', () => {
    expect(importMovementsSchema.safeParse({ idempotencyKey: 'abcd1234', rows: [] }).success).toBe(false)
    const muitas = Array.from({ length: IMPORT_MOVEMENTS_MAX_ROWS + 1 }, (_, i) => linha(i + 1))
    expect(importMovementsSchema.safeParse({ idempotencyKey: 'abcd1234', rows: muitas }).success).toBe(false)
    const limite = Array.from({ length: IMPORT_MOVEMENTS_MAX_ROWS }, (_, i) => linha(i + 1))
    expect(importMovementsSchema.safeParse({ idempotencyKey: 'abcd1234', rows: limite }).success).toBe(true)
  })
})

describe('importMovementRowSchema', () => {
  it('o número da linha é obrigatório e inteiro a partir de 1', () => {
    const { row, ...semLinha } = linha(1)
    expect(row).toBe(1)
    expect(importMovementRowSchema.safeParse(semLinha).success).toBe(false)
    expect(importMovementRowSchema.safeParse(linha(0)).success).toBe(false)
    expect(importMovementRowSchema.safeParse(linha(1.5)).success).toBe(false)
  })

  it('herda as regras do register: valor positivo e título até 120', () => {
    expect(importMovementRowSchema.safeParse(linha(1, { grossValue: 0 })).success).toBe(false)
    expect(importMovementRowSchema.safeParse(linha(1, { title: 'x'.repeat(121) })).success).toBe(false)
  })

  it('aceita confirmDuplicate, como o register', () => {
    expect(importMovementRowSchema.safeParse(linha(1, { confirmDuplicate: true })).success).toBe(true)
  })
})
