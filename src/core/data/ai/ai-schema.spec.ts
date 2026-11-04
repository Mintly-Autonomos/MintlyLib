import {
  AI_DAILY_LIMIT,
  AI_INSIGHT_MAX_WORDS,
  AI_INSIGHT_PAGES,
  AI_MAX_PRICE_INCREASE_PERCENT,
  AI_PRICE_REASON_MAX_WORDS,
  aiInsightsRequestSchema,
  aiPriceSuggestionRequestSchema,
} from './ai-schema'

describe('limites da IA', () => {
  it('valores combinados: 20 chamadas por dia, 35 palavras por card, 45 na justificativa, aumento de até 20%', () => {
    expect(AI_DAILY_LIMIT).toBe(20)
    expect(AI_INSIGHT_MAX_WORDS).toBe(35)
    expect(AI_PRICE_REASON_MAX_WORDS).toBe(45)
    expect(AI_MAX_PRICE_INCREASE_PERCENT).toBe(20)
    expect(AI_INSIGHT_PAGES).toEqual(['overview'])
  })
})

describe('aiInsightsRequestSchema', () => {
  it('aceita a tela com ou sem mês', () => {
    expect(aiInsightsRequestSchema.safeParse({ page: 'overview' }).success).toBe(true)
    expect(aiInsightsRequestSchema.safeParse({ page: 'overview', month: '2026-10' }).success).toBe(true)
  })

  it('recusa tela desconhecida, tela ausente e campos a mais (o texto e os dados nunca vêm do cliente)', () => {
    expect(aiInsightsRequestSchema.safeParse({ page: 'custos' }).success).toBe(false)
    expect(aiInsightsRequestSchema.safeParse({}).success).toBe(false)
    expect(aiInsightsRequestSchema.safeParse({ page: 'overview', insights: [{ kind: 'x' }] }).success).toBe(false)
    expect(aiInsightsRequestSchema.safeParse({ page: 'overview', restaurantId: 'r1' }).success).toBe(false)
  })
})

describe('aiPriceSuggestionRequestSchema', () => {
  it('aceita com ou sem prato', () => {
    expect(aiPriceSuggestionRequestSchema.safeParse({}).success).toBe(true)
    expect(aiPriceSuggestionRequestSchema.safeParse({ menuItemId: 'abc' }).success).toBe(true)
  })

  it('recusa o preço vindo do cliente e campos a mais (quem decide o preço sugerido é a API)', () => {
    expect(aiPriceSuggestionRequestSchema.safeParse({ menuItemId: 'abc', price: 30 }).success).toBe(false)
    expect(aiPriceSuggestionRequestSchema.safeParse({ menuItemId: 5 }).success).toBe(false)
  })
})
