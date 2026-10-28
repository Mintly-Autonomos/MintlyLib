import type {
  MovementDirection,
  MovementStatus,
  PaymentMethod,
  MovementOrigin,
  CounterpartyKind,
  MovementChannel,
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
  /** Subcategoria da categoria escolhida; tem que estar ativa. */
  subcategoryId?: string
  channel?: MovementChannel
  /**
   * Vencimento (`AAAA-MM-DD`): o dia em que o dinheiro entra/sai. Ausente = à vista (nasce
   * liquidado). Em conta de plataforma o servidor calcula (`date` + prazo) se não vier.
   */
  dueDate?: string | Date
}

/**
 * Corpo de PATCH /financial-movements/:id/status. `settledAt` só vale quando o
 * novo status é `settled`: é quando o dinheiro mexeu de fato (ex.: "paguei o
 * boleto na sexta e só lancei na segunda"). Ausente = agora. Data futura → 400.
 */
export interface ChangeMovementStatusRequest {
  status: MovementStatus
  settledAt?: string | Date
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
  /** `null` limpa; a API valida o documento resultante, não este schema. */
  subcategoryId?: string | null
  /** `null` limpa (volta ao canal efetivo). */
  channel?: MovementChannel | null
  /** `null` limpa o vencimento (vira à vista); a API valida o documento resultante. */
  dueDate?: string | Date | null
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
