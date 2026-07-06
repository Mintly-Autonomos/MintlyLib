import { Sapphire } from '@ascendance-hub/sapphire-core'
import { auditSchema } from '../common/audit'
import { FinancialAccountType } from './financial-account-schema'
import { CategoryType } from './financial-category-schema'

const s = new Sapphire()

/**
 * Schema unificado de movimentação financeira (MIN-49/50, modelo único).
 * Collection `financial_movements` (snake_case); campos camelCase.
 *
 * Dinheiro (grossValue/feeValue/netValue) é modelado aqui logicamente como
 * `number` (sapphire-core). O Decimal128 é aplicado no lado da API na
 * persistência, via driver do mongo (`Decimal128` + `$inc`) — NÃO via
 * sapphire-bson: ele só gera validator de collection e não suporta `decimal`
 * (mapeia number -> bsonType 'number'). Ver Sapphire issue #39.
 */

export enum MovementDirection {
  In = 'in',
  Out = 'out',
}

export enum MovementStatus {
  Pending = 'pending',
  Settled = 'settled',
  Cancelled = 'cancelled',
}

export enum PaymentMethod {
  Cash = 'cash',
  Pix = 'pix',
  Debit = 'debit',
  Credit = 'credit',
  Transfer = 'transfer',
  Boleto = 'boleto',
  DigitalWallet = 'digitalWallet',
}

export enum MovementOrigin {
  Manual = 'manual',
  Sefaz = 'sefaz',
}

export enum CounterpartyKind {
  Client = 'client',
  Supplier = 'supplier',
}

/**
 * Extended Reference da conta: snapshot { _id, name, type } embutido no
 * movimento (fidelidade histórica — renomear a conta não altera movimentos
 * passados). O saldo continua sendo lido do doc vivo da conta.
 */
const accountRefSchema = s.object({
  _id: s.string(),
  name: s.string(),
  type: s.type().enum(FinancialAccountType),
})

/**
 * Campos comuns às duas direções. `direction` e `category` ficam nas variantes
 * (união discriminada), pois a categoria é restrita por direção:
 * in → revenue, out → expense.
 */
const baseMovementSchema = s.object({
  restaurantId: s.string(),
  title: s.string().max(120),
  status: s.type().enum(MovementStatus),
  // `date` é informado pelo usuário (chega como ISO string no request); .coerce()
  // normaliza p/ Date. Os demais campos de data abaixo são preenchidos pelo
  // sistema com Date real, então ficam estritos (igual ao auditSchema).
  date: s.date().coerce(),

  // Dinheiro (Decimal128 na API). grossValue > 0; feeValue/netValue >= 0.
  grossValue: s.number().positive(),
  feeValue: s.number().min(0).default(0),
  netValue: s.number().min(0),

  // Snapshot da conta `platform` no momento do registro (mudança futura na
  // conta não altera o histórico). Ausentes em contas sem prazo/taxa.
  feePercentApplied: s.number().int().min(0).optional(),
  settlementDaysApplied: s.number().int().min(0).optional(),
  predictedReceiptDate: s.date().optional(),

  account: accountRefSchema,

  paymentMethod: s.type().enum(PaymentMethod),

  counterparty: s.object({
    name: s.string(),
    kind: s.type().enum(CounterpartyKind),
    refId: s.string().optional(),
  }).optional(),

  fiscalNote: s.string().optional(),
  description: s.string().max(500).optional(),

  origin: s.type().enum(MovementOrigin),

  history: s.array(
    s.object({
      at: s.date(), // Date real (preenchido pelo sistema), não string ISO
      by: s.string(),
      action: s.string(),
      detail: s.string().optional(),
    }),
  ).default([]),

  audit: auditSchema,
})

// Entrada: categoria precisa ser de receita (revenue).
const inMovementSchema = baseMovementSchema.extend({
  direction: s.type().literal(MovementDirection.In),
  category: s.object({
    _id: s.string(),
    name: s.string(),
    type: s.type().literal(CategoryType.Revenue),
  }),
})

// Saída: categoria precisa ser de despesa (expense).
const outMovementSchema = baseMovementSchema.extend({
  direction: s.type().literal(MovementDirection.Out),
  category: s.object({
    _id: s.string(),
    name: s.string(),
    type: s.type().literal(CategoryType.Expense),
  }),
})

// União discriminada por `direction`: força a coerência categoria × direção.
export const financialMovementSchema = s.type().union([
  inMovementSchema,
  outMovementSchema,
])

// Sub-doc opcional da contraparte no request (cliente/fornecedor).
const counterpartyRequestSchema = s.object({
  name: s.string(),
  kind: s.type().enum(CounterpartyKind),
  refId: s.string().optional(),
})

/**
 * Schema de REGISTRO (POST /financial-movements). NÃO é o schema da entity: o
 * client envia `accountId`/`categoryId` (não os snapshots), e o servidor resolve
 * conta+categoria vivas, monta os Extended References e computa fee/net/data
 * prevista dentro da transação. Espelha o `RegisterMovementInput` da API.
 */
export const registerMovementSchema = s.object({
  direction: s.type().enum(MovementDirection),
  title: s.string().max(120),
  grossValue: s.number().positive(),
  date: s.date().coerce(),
  accountId: s.string(),
  categoryId: s.string(),
  paymentMethod: s.type().enum(PaymentMethod),
  status: s.type().enum(MovementStatus).optional(),
  counterparty: counterpartyRequestSchema.optional(),
  fiscalNote: s.string().optional(),
  description: s.string().max(500).optional(),
  origin: s.type().enum(MovementOrigin).optional(),
  // Confirmação explícita para persistir uma possível duplicata (<2min).
  confirmDuplicate: s.boolean().optional(),
})

/**
 * Schema de EDIÇÃO (PATCH /financial-movements/:id). Todos os campos opcionais;
 * `direction` é imutável (não entra aqui). Espelha o `UpdateMovementInput`.
 */
export const updateMovementSchema = s.object({
  title: s.string().max(120),
  grossValue: s.number().positive(),
  date: s.date().coerce(),
  paymentMethod: s.type().enum(PaymentMethod),
  status: s.type().enum(MovementStatus),
  accountId: s.string(),
  categoryId: s.string(),
  counterparty: counterpartyRequestSchema,
  fiscalNote: s.string(),
  description: s.string().max(500),
}).partial()

/** Corpo de PATCH /financial-movements/:id/status. */
export const changeMovementStatusSchema = s.object({
  status: s.type().enum(MovementStatus),
})

/** Corpo de POST /financial-movements/recompute-balances. */
export const recomputeBalancesSchema = s.object({
  accountId: s.string(),
})
