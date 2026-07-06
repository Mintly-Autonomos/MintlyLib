import type {
  MovementDirection,
  MovementStatus,
  PaymentMethod,
  MovementOrigin,
  CounterpartyKind,
} from './financial-movement-schema'

/** Contraparte (cliente/fornecedor) enviada no request. */
export interface MovementCounterpartyInput {
  name: string
  kind: CounterpartyKind
  refId?: string
}

/**
 * Corpo de POST /financial-movements. O client envia `accountId`/`categoryId`
 * (não os snapshots): o servidor resolve conta+categoria vivas, monta os
 * Extended References e computa fee/net/data-prevista na transação.
 */
export interface RegisterMovementRequest {
  direction: MovementDirection
  title: string
  grossValue: number
  date: string | Date
  accountId: string
  categoryId: string
  paymentMethod: PaymentMethod
  status?: MovementStatus
  counterparty?: MovementCounterpartyInput
  fiscalNote?: string
  description?: string
  origin?: MovementOrigin
  /** Confirma persistir uma possível duplicata (<2min). */
  confirmDuplicate?: boolean
}

/** Corpo de PATCH /financial-movements/:id. `direction` é imutável. */
export interface UpdateMovementRequest {
  title?: string
  grossValue?: number
  date?: string | Date
  paymentMethod?: PaymentMethod
  status?: MovementStatus
  accountId?: string
  categoryId?: string
  counterparty?: MovementCounterpartyInput
  fiscalNote?: string
  description?: string
}

/** Filtros de GET /financial-movements. */
export interface MovementListQuery {
  q?: string
  direction?: MovementDirection
  status?: MovementStatus
  dateFrom?: string | Date
  dateTo?: string | Date
  page?: number
  size?: number
}

/** Resposta de ações que retornam apenas a mensagem ao usuário (ex.: recompute). */
export interface FinancialMovementActionResult {
  message: string
}
