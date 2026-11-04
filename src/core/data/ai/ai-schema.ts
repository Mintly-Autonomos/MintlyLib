import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/**
 * IA do Mintly (Claude Haiku): reescreve o texto dos cards de insight para cada restaurante e sugere o aumento de
 * preço de um prato parado. Os dados do card e do prato são montados NO SERVIDOR a partir do token (restaurante e
 * usuário nunca vêm do cliente), e os limites abaixo são aplicados pela API; o front só os mostra.
 */

/** Quantas chamadas à IA cada restaurante pode fazer por dia (texto repetido do cache não conta). */
export const AI_DAILY_LIMIT = 20

/** Máximo de palavras no texto de um card de insight (título e descrição somados). */
export const AI_INSIGHT_MAX_WORDS = 35

/** Máximo de palavras na justificativa da sugestão de preço. */
export const AI_PRICE_REASON_MAX_WORDS = 45

/** Maior aumento de preço que a IA pode sugerir de uma vez, em % do preço atual. */
export const AI_MAX_PRICE_INCREASE_PERCENT = 20

/** Telas cujos cards de insight a IA sabe reescrever. */
export const AI_INSIGHT_PAGES = ['overview'] as const
export type AiInsightPage = (typeof AI_INSIGHT_PAGES)[number]

/** Corpo do `POST /ai/insights`: a tela e, se for o caso, o mês (`AAAA-MM`, o mesmo da própria tela). */
export const aiInsightsRequestSchema = s.object({
  page: s.type().enum([...AI_INSIGHT_PAGES]),
  month: s.string().optional(),
})
export type AiInsightsRequest = Infer<typeof aiInsightsRequestSchema>

/** Corpo do `POST /ai/price-suggestion`: um prato; sem `menuItemId` a IA escolhe o que está há mais tempo sem mudar. */
export const aiPriceSuggestionRequestSchema = s.object({
  menuItemId: s.string().optional(),
})
export type AiPriceSuggestionRequest = Infer<typeof aiPriceSuggestionRequestSchema>

/** Uso da IA hoje (por restaurante). */
export interface AiUsage {
  limitPerDay: number
  usedToday: number
  remainingToday: number
}

/** Texto novo de UM insight. `index`/`kind` identificam o insight na lista que a tela já tem. */
export interface AiInsightText {
  index: number
  kind: string
  title: string
  description: string
}

export interface AiInsightsResponse extends AiUsage {
  page: AiInsightPage
  insights: AiInsightText[]
  /** `true` quando o texto veio do cache (mesmos dados, mesmo dia): não gastou chamada do dia. */
  cached: boolean
}

export interface AiPriceSuggestion extends AiUsage {
  menuItemId: string
  name: string
  currentPrice: number
  suggestedPrice: number
  /** Aumento sobre o preço atual, em % (0 a `AI_MAX_PRICE_INCREASE_PERCENT`). */
  increasePercent: number
  reason: string
  cached: boolean
}
