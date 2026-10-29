import { Sapphire } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/** Planos disponíveis, em meses de acesso. */
export const SUBSCRIPTION_PLAN_MONTHS = [1, 3, 6, 12] as const
export type SubscriptionPlanMonths = (typeof SUBSCRIPTION_PLAN_MONTHS)[number]

/** Valor base de um mês, em centavos (R$ 150,00). Dinheiro sempre em centavos inteiros. */
export const SUBSCRIPTION_MONTHLY_PRICE_CENTS = 15000

/** Desconto (em %) sobre o valor cheio de cada plano. */
export const SUBSCRIPTION_DISCOUNT_PERCENT: Record<SubscriptionPlanMonths, number> = {
  1: 0,
  3: 5,
  6: 10,
  12: 15,
}

/** Quantos dias antes do vencimento o app começa a avisar. */
export const SUBSCRIPTION_EXPIRY_WARNING_DAYS = 3

export type SubscriptionStatusName = 'active' | 'expired' | 'none'

/** Provedor de pagamento em uso (o front mostra o simulador só com `mock`). */
export type PaymentProviderName = 'mock' | 'mercadopago'

export function isSubscriptionPlan (months: unknown): months is SubscriptionPlanMonths {
  return (SUBSCRIPTION_PLAN_MONTHS as readonly unknown[]).includes(months)
}

export interface SubscriptionPlanOption {
  months: SubscriptionPlanMonths
  discountPercent: number
  /** Valor sem desconto (meses × base). */
  listCents: number
  /** Valor a pagar. */
  totalCents: number
  /** Valor por mês já com desconto (arredondado ao centavo). */
  perMonthCents: number
}

/** Preço de um plano. Todo o cálculo em centavos inteiros: nada de ponto flutuante em dinheiro. */
export function subscriptionPlanPrice (months: SubscriptionPlanMonths): SubscriptionPlanOption {
  const discountPercent = SUBSCRIPTION_DISCOUNT_PERCENT[months]
  const listCents = months * SUBSCRIPTION_MONTHLY_PRICE_CENTS
  const totalCents = Math.round((listCents * (100 - discountPercent)) / 100)
  return { months, discountPercent, listCents, totalCents, perMonthCents: Math.round(totalCents / months) }
}

export function subscriptionPlans (): SubscriptionPlanOption[] {
  return SUBSCRIPTION_PLAN_MONTHS.map(subscriptionPlanPrice)
}

/** Estado da assinatura devolvido ao front. `endsAt` em ISO; `null` quando nunca assinou. */
export interface SubscriptionState {
  status: SubscriptionStatusName
  endsAt: string | null
  /** Dias inteiros que faltam (arredondado para cima); `null` sem assinatura ativa. */
  daysLeft: number | null
  /** Ativa e faltando 3 dias ou menos: o app avisa. */
  expiresSoon: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Estado da assinatura a partir da data limite. Ativa só ENQUANTO `agora < endsAt`: no instante do
 * vencimento a pessoa já é tratada como sem assinatura (vai para a tela de assinatura).
 */
export function computeSubscriptionState (endsAt: Date | string | null | undefined, now: Date = new Date()): SubscriptionState {
  if (endsAt === null || endsAt === undefined) {
    return { status: 'none', endsAt: null, daysLeft: null, expiresSoon: false }
  }
  const end = endsAt instanceof Date ? endsAt : new Date(endsAt)
  if (Number.isNaN(end.getTime())) {
    return { status: 'none', endsAt: null, daysLeft: null, expiresSoon: false }
  }
  const iso = end.toISOString()
  const remaining = end.getTime() - now.getTime()
  if (remaining <= 0) {
    return { status: 'expired', endsAt: iso, daysLeft: null, expiresSoon: false }
  }
  const daysLeft = Math.ceil(remaining / DAY_MS)
  return { status: 'active', endsAt: iso, daysLeft, expiresSoon: daysLeft <= SUBSCRIPTION_EXPIRY_WARNING_DAYS }
}

/** Soma meses de calendário a uma data (31/jan + 1 mês = 28 ou 29/fev: não vaza para março). */
export function addMonths (date: Date, months: number): Date {
  const d = new Date(date.getTime())
  const day = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, lastDay))
  return d
}

/**
 * Nova data limite após um pagamento aprovado. Renovar antes de vencer SOMA ao que sobrou (quem paga
 * adiantado não perde dias); vencida ou sem assinatura, conta a partir de agora.
 */
export function extendSubscription (currentEndsAt: Date | null | undefined, months: number, now: Date = new Date()): Date {
  const base = currentEndsAt && currentEndsAt.getTime() > now.getTime() ? currentEndsAt : now
  return addMonths(base, months)
}

/** Corpo de POST /subscription/checkout. O valor NUNCA vem do cliente: a API recalcula pelo plano. */
export const subscriptionCheckoutSchema = s.object({
  months: s.number().int().min(1).max(12),
})

export interface SubscriptionCheckoutRequest {
  months: SubscriptionPlanMonths
}

export interface SubscriptionCheckoutResponse {
  /** Id do pagamento no Mintly (não o do provedor). */
  paymentId: string
  /** Para onde levar a pessoa para pagar. */
  checkoutUrl: string
  provider: PaymentProviderName
  months: SubscriptionPlanMonths
  totalCents: number
}

/** Resposta de GET /subscription: estado + o que o front precisa para montar a tela. */
export interface SubscriptionOverview extends SubscriptionState {
  plans: SubscriptionPlanOption[]
  provider: PaymentProviderName
}

/** Corpo de POST /subscription/mock/decide (só existe com o provedor simulado). */
export interface SubscriptionMockDecision {
  paymentId: string
  decision: 'approved' | 'rejected'
}
