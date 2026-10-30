import { Sapphire } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/** Planos disponíveis, em meses de acesso. */
export const SUBSCRIPTION_PLAN_MONTHS = [1, 3, 6, 12] as const
export type SubscriptionPlanMonths = (typeof SUBSCRIPTION_PLAN_MONTHS)[number]

/** Tipos de assinatura. O Pro ainda não tem vantagens extras: elas virão depois, por cima deste campo. */
export const SUBSCRIPTION_TIERS = ['basic', 'pro'] as const
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]

/** Tipo assumido para contas que têm `endsAt` mas nunca gravaram o tipo (liberadas à mão no banco). */
export const DEFAULT_SUBSCRIPTION_TIER: SubscriptionTier = 'basic'

export const SUBSCRIPTION_TIER_LABEL: Record<SubscriptionTier, string> = {
  basic: 'Básico',
  pro: 'Pro',
}

/** Valor base de um mês de cada tipo, em centavos (Básico R$ 150,00; Pro R$ 229,00). Dinheiro sempre em centavos inteiros. */
export const SUBSCRIPTION_MONTHLY_PRICE_CENTS: Record<SubscriptionTier, number> = {
  basic: 15000,
  pro: 22900,
}

/** Desconto (em %) sobre o valor cheio de cada plano. É o mesmo para todos os tipos. */
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

export function isSubscriptionTier (tier: unknown): tier is SubscriptionTier {
  return (SUBSCRIPTION_TIERS as readonly unknown[]).includes(tier)
}

export interface SubscriptionPlanOption {
  tier: SubscriptionTier
  months: SubscriptionPlanMonths
  discountPercent: number
  /** Valor sem desconto (meses × base do tipo). */
  listCents: number
  /** Valor a pagar. */
  totalCents: number
  /** Valor por mês já com desconto (arredondado ao centavo). */
  perMonthCents: number
}

/** Preço de um plano. Todo o cálculo em centavos inteiros: nada de ponto flutuante em dinheiro. */
export function subscriptionPlanPrice (months: SubscriptionPlanMonths, tier: SubscriptionTier = DEFAULT_SUBSCRIPTION_TIER): SubscriptionPlanOption {
  const discountPercent = SUBSCRIPTION_DISCOUNT_PERCENT[months]
  const listCents = months * SUBSCRIPTION_MONTHLY_PRICE_CENTS[tier]
  const totalCents = Math.round((listCents * (100 - discountPercent)) / 100)
  return { tier, months, discountPercent, listCents, totalCents, perMonthCents: Math.round(totalCents / months) }
}

export function subscriptionPlans (tier: SubscriptionTier = DEFAULT_SUBSCRIPTION_TIER): SubscriptionPlanOption[] {
  return SUBSCRIPTION_PLAN_MONTHS.map((months) => subscriptionPlanPrice(months, tier))
}

/** Um tipo de assinatura com seus planos (1, 3, 6 e 12 meses), como a tela mostra. */
export interface SubscriptionTierOption {
  tier: SubscriptionTier
  label: string
  monthlyCents: number
  plans: SubscriptionPlanOption[]
}

export function subscriptionTiers (): SubscriptionTierOption[] {
  return SUBSCRIPTION_TIERS.map((tier) => ({
    tier,
    label: SUBSCRIPTION_TIER_LABEL[tier],
    monthlyCents: SUBSCRIPTION_MONTHLY_PRICE_CENTS[tier],
    plans: subscriptionPlans(tier),
  }))
}

/** Estado da assinatura devolvido ao front. `endsAt` em ISO; `null` quando nunca assinou. */
export interface SubscriptionState {
  status: SubscriptionStatusName
  /** Tipo da assinatura (o último, se estiver vencida); `null` quando nunca assinou. */
  tier: SubscriptionTier | null
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
export function computeSubscriptionState (
  endsAt: Date | string | null | undefined,
  now: Date = new Date(),
  tier?: unknown,
): SubscriptionState {
  if (endsAt === null || endsAt === undefined) {
    return { status: 'none', tier: null, endsAt: null, daysLeft: null, expiresSoon: false }
  }
  const end = endsAt instanceof Date ? endsAt : new Date(endsAt)
  if (Number.isNaN(end.getTime())) {
    return { status: 'none', tier: null, endsAt: null, daysLeft: null, expiresSoon: false }
  }
  const resolvedTier = isSubscriptionTier(tier) ? tier : DEFAULT_SUBSCRIPTION_TIER
  const iso = end.toISOString()
  const remaining = end.getTime() - now.getTime()
  if (remaining <= 0) {
    return { status: 'expired', tier: resolvedTier, endsAt: iso, daysLeft: null, expiresSoon: false }
  }
  const daysLeft = Math.ceil(remaining / DAY_MS)
  return { status: 'active', tier: resolvedTier, endsAt: iso, daysLeft, expiresSoon: daysLeft <= SUBSCRIPTION_EXPIRY_WARNING_DAYS }
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

/**
 * Resultado de um pagamento aprovado. Mesmo tipo e ainda ativa: SOMA ao que sobrou. Tipo diferente
 * (upgrade OU downgrade): sem desconto nem crédito pelo que sobrou, e o novo tipo começa a contar
 * HOJE (não quando o outro acabaria). Vencida ou sem assinatura: conta a partir de agora.
 */
export interface SubscriptionPurchaseResult {
  endsAt: Date
  tier: SubscriptionTier
  /** O tipo mudou com a assinatura ainda ativa: o tempo que sobrava do tipo anterior foi descartado. */
  replacedActive: boolean
  /** Ponto a partir do qual o tempo comprado foi contado. */
  startedAt: Date
}

export function applySubscriptionPurchase (
  current: { endsAt?: Date | null, tier?: unknown },
  purchase: { tier: SubscriptionTier, months: number },
  now: Date = new Date(),
): SubscriptionPurchaseResult {
  const currentEnd = current.endsAt ?? null
  const active = currentEnd !== null && currentEnd.getTime() > now.getTime()
  const currentTier = isSubscriptionTier(current.tier) ? current.tier : DEFAULT_SUBSCRIPTION_TIER
  const keepsRemaining = active && currentTier === purchase.tier
  const startedAt = keepsRemaining ? currentEnd : now
  return {
    endsAt: addMonths(startedAt, purchase.months),
    tier: purchase.tier,
    replacedActive: active && !keepsRemaining,
    startedAt,
  }
}

/** Corpo de POST /subscription/checkout. O valor NUNCA vem do cliente: a API recalcula pelo plano. */
export const subscriptionCheckoutSchema = s.object({
  months: s.number().int().min(1).max(12),
  tier: s.type().enum([...SUBSCRIPTION_TIERS]).optional(),
})

export interface SubscriptionCheckoutRequest {
  months: SubscriptionPlanMonths
  /** Omitido = Básico. */
  tier?: SubscriptionTier
}

export interface SubscriptionCheckoutResponse {
  /** Id do pagamento no Mintly (não o do provedor). */
  paymentId: string
  /** Para onde levar a pessoa para pagar. */
  checkoutUrl: string
  provider: PaymentProviderName
  tier: SubscriptionTier
  months: SubscriptionPlanMonths
  totalCents: number
}

/** Resposta de GET /subscription: estado + o que o front precisa para montar a tela. */
export interface SubscriptionOverview extends SubscriptionState {
  /** Cada tipo à venda com seus planos de 1, 3, 6 e 12 meses. */
  tiers: SubscriptionTierOption[]
  provider: PaymentProviderName
}

/** Corpo de POST /subscription/mock/decide (só existe com o provedor simulado). */
export interface SubscriptionMockDecision {
  paymentId: string
  decision: 'approved' | 'rejected'
}
