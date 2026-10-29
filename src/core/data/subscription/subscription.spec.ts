import {
  addMonths,
  computeSubscriptionState,
  extendSubscription,
  isSubscriptionPlan,
  subscriptionCheckoutSchema,
  subscriptionPlanPrice,
  subscriptionPlans,
} from './subscription'

describe('preços dos planos (R$ 150/mês; 3 meses 5%, 6 meses 10%, 12 meses 15%)', () => {
  it('1 mês: R$ 150,00 sem desconto', () => {
    expect(subscriptionPlanPrice(1)).toEqual({ months: 1, discountPercent: 0, listCents: 15000, totalCents: 15000, perMonthCents: 15000 })
  })

  it('3 meses: 5% → R$ 427,50', () => {
    expect(subscriptionPlanPrice(3)).toMatchObject({ discountPercent: 5, listCents: 45000, totalCents: 42750, perMonthCents: 14250 })
  })

  it('6 meses: 10% → R$ 810,00', () => {
    expect(subscriptionPlanPrice(6)).toMatchObject({ discountPercent: 10, listCents: 90000, totalCents: 81000, perMonthCents: 13500 })
  })

  it('12 meses: 15% → R$ 1.530,00', () => {
    expect(subscriptionPlanPrice(12)).toMatchObject({ discountPercent: 15, listCents: 180000, totalCents: 153000, perMonthCents: 12750 })
  })

  it('o total é sempre um número inteiro de centavos', () => {
    for (const p of subscriptionPlans()) expect(Number.isInteger(p.totalCents)).toBe(true)
  })

  it('só os planos 1, 3, 6 e 12 existem', () => {
    expect(subscriptionPlans().map((p) => p.months)).toEqual([1, 3, 6, 12])
    expect([1, 3, 6, 12].every(isSubscriptionPlan)).toBe(true)
    expect([0, 2, 4, 5, 13, '3', null, undefined].some(isSubscriptionPlan)).toBe(false)
  })
})

describe('computeSubscriptionState', () => {
  const now = new Date('2026-10-30T12:00:00.000Z')
  const inMs = (ms: number) => new Date(now.getTime() + ms)
  const DAY = 24 * 60 * 60 * 1000

  it('sem data limite: none (nunca assinou)', () => {
    expect(computeSubscriptionState(undefined, now)).toEqual({ status: 'none', endsAt: null, daysLeft: null, expiresSoon: false })
    expect(computeSubscriptionState(null, now).status).toBe('none')
  })

  it('data inválida conta como sem assinatura', () => {
    expect(computeSubscriptionState('lixo', now).status).toBe('none')
  })

  it('longe do vencimento: ativa, sem aviso', () => {
    const s = computeSubscriptionState(inMs(40 * DAY), now)
    expect(s).toMatchObject({ status: 'active', daysLeft: 40, expiresSoon: false })
  })

  it('a 3 dias do vencimento: ativa e avisa', () => {
    const s = computeSubscriptionState(inMs(3 * DAY), now)
    expect(s).toMatchObject({ status: 'active', daysLeft: 3, expiresSoon: true })
  })

  it('a 4 dias ainda não avisa; a 2 dias avisa', () => {
    expect(computeSubscriptionState(inMs(4 * DAY), now).expiresSoon).toBe(false)
    expect(computeSubscriptionState(inMs(2 * DAY), now).expiresSoon).toBe(true)
  })

  it('faltando menos de um dia: ainda ativa, 1 dia', () => {
    expect(computeSubscriptionState(inMs(3 * 60 * 60 * 1000), now)).toMatchObject({ status: 'active', daysLeft: 1, expiresSoon: true })
  })

  it('no instante do vencimento já é vencida (vai para a tela de assinatura)', () => {
    expect(computeSubscriptionState(now, now)).toMatchObject({ status: 'expired', daysLeft: null, expiresSoon: false })
  })

  it('depois do vencimento: expired, mas guarda a data', () => {
    const end = inMs(-DAY)
    expect(computeSubscriptionState(end, now)).toEqual({ status: 'expired', endsAt: end.toISOString(), daysLeft: null, expiresSoon: false })
  })

  it('aceita a data como texto ISO (como vem do JSON)', () => {
    expect(computeSubscriptionState(inMs(10 * DAY).toISOString(), now).status).toBe('active')
  })
})

describe('addMonths', () => {
  it('soma meses de calendário', () => {
    expect(addMonths(new Date('2026-10-30T10:00:00Z'), 1).toISOString()).toBe('2026-11-30T10:00:00.000Z')
    expect(addMonths(new Date('2026-10-30T10:00:00Z'), 12).toISOString()).toBe('2027-10-30T10:00:00.000Z')
  })

  it('31/jan + 1 mês cai no fim de fevereiro, não em março', () => {
    expect(addMonths(new Date('2026-01-31T00:00:00Z'), 1).toISOString()).toBe('2026-02-28T00:00:00.000Z')
    expect(addMonths(new Date('2028-01-31T00:00:00Z'), 1).toISOString()).toBe('2028-02-29T00:00:00.000Z')
  })

  it('vira o ano', () => {
    expect(addMonths(new Date('2026-11-15T00:00:00Z'), 3).toISOString()).toBe('2027-02-15T00:00:00.000Z')
  })

  it('não altera a data recebida', () => {
    const d = new Date('2026-10-30T00:00:00Z')
    addMonths(d, 6)
    expect(d.toISOString()).toBe('2026-10-30T00:00:00.000Z')
  })
})

describe('extendSubscription (renovação)', () => {
  const now = new Date('2026-10-30T12:00:00.000Z')

  it('sem assinatura: conta a partir de agora', () => {
    expect(extendSubscription(undefined, 1, now).toISOString()).toBe('2026-11-30T12:00:00.000Z')
    expect(extendSubscription(null, 3, now).toISOString()).toBe('2027-01-30T12:00:00.000Z')
  })

  it('vencida: conta a partir de agora, não da data antiga', () => {
    expect(extendSubscription(new Date('2026-01-01T00:00:00Z'), 1, now).toISOString()).toBe('2026-11-30T12:00:00.000Z')
  })

  it('ainda ativa: SOMA ao que sobrou (quem renova adiantado não perde dias)', () => {
    expect(extendSubscription(new Date('2026-11-10T12:00:00Z'), 1, now).toISOString()).toBe('2026-12-10T12:00:00.000Z')
  })
})

describe('subscriptionCheckoutSchema', () => {
  it('aceita um número inteiro de meses', () => {
    expect(() => subscriptionCheckoutSchema.parse({ months: 3 })).not.toThrow()
  })

  it('recusa o que não é número inteiro ou está fora da faixa', () => {
    expect(() => subscriptionCheckoutSchema.parse({ months: 1.5 })).toThrow()
    expect(() => subscriptionCheckoutSchema.parse({ months: 0 })).toThrow()
    expect(() => subscriptionCheckoutSchema.parse({})).toThrow()
  })
})
