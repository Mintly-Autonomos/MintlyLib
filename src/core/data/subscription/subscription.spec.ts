import {
  SUBSCRIPTION_PLAN_DAYS,
  addDays,
  applySubscriptionPurchase,
  computeSubscriptionState,
  isSubscriptionPlan,
  isSubscriptionTier,
  subscriptionCheckoutSchema,
  subscriptionPlanPrice,
  subscriptionPlans,
  subscriptionTiers,
} from './subscription'

describe('preços dos planos (R$ 150/mês; 3 meses 5%, 6 meses 10%, 12 meses 15%)', () => {
  it('1 mês: R$ 150,00 sem desconto', () => {
    expect(subscriptionPlanPrice(1)).toEqual({ tier: 'basic', months: 1, days: 30, discountPercent: 0, listCents: 15000, totalCents: 15000, perMonthCents: 15000 })
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

describe('preços do Pro (R$ 229/mês, mesmos descontos por quantidade)', () => {
  it('1 mês: R$ 229,00 sem desconto', () => {
    expect(subscriptionPlanPrice(1, 'pro')).toEqual({ tier: 'pro', months: 1, days: 30, discountPercent: 0, listCents: 22900, totalCents: 22900, perMonthCents: 22900 })
  })

  it('3 meses: 5% → R$ 652,65', () => {
    expect(subscriptionPlanPrice(3, 'pro')).toMatchObject({ discountPercent: 5, listCents: 68700, totalCents: 65265 })
  })

  it('6 meses: 10% → R$ 1.236,60', () => {
    expect(subscriptionPlanPrice(6, 'pro')).toMatchObject({ discountPercent: 10, listCents: 137400, totalCents: 123660 })
  })

  it('12 meses: 15% → R$ 2.335,80', () => {
    expect(subscriptionPlanPrice(12, 'pro')).toMatchObject({ discountPercent: 15, listCents: 274800, totalCents: 233580, perMonthCents: 19465 })
  })

  it('o total é sempre inteiro e o Pro custa mais que o Básico em todos os planos', () => {
    const pro = subscriptionPlans('pro')
    const basic = subscriptionPlans('basic')
    pro.forEach((p, i) => {
      expect(Number.isInteger(p.totalCents)).toBe(true)
      expect(p.totalCents).toBeGreaterThan(basic[i]!.totalCents)
    })
  })

  it('subscriptionTiers lista Básico e Pro, cada um com os 4 planos', () => {
    const tiers = subscriptionTiers()
    expect(tiers.map((t) => [t.tier, t.label, t.monthlyCents])).toEqual([
      ['basic', 'Básico', 15000],
      ['pro', 'Pro', 22900],
    ])
    tiers.forEach((t) => expect(t.plans.map((p) => p.months)).toEqual([1, 3, 6, 12]))
  })

  it('isSubscriptionTier só aceita basic e pro', () => {
    expect(isSubscriptionTier('basic') && isSubscriptionTier('pro')).toBe(true)
    expect(['premium', 'PRO', null, undefined, 1].some(isSubscriptionTier)).toBe(false)
  })
})

describe('computeSubscriptionState', () => {
  const now = new Date('2026-10-30T12:00:00.000Z')
  const inMs = (ms: number) => new Date(now.getTime() + ms)
  const DAY = 24 * 60 * 60 * 1000

  it('sem data limite: none (nunca assinou)', () => {
    expect(computeSubscriptionState(undefined, now)).toEqual({ status: 'none', tier: null, endsAt: null, daysLeft: null, expiresSoon: false })
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
    expect(computeSubscriptionState(end, now)).toEqual({ status: 'expired', tier: 'basic', endsAt: end.toISOString(), daysLeft: null, expiresSoon: false })
  })

  it('guarda o tipo: pro fica pro, ativa ou vencida', () => {
    expect(computeSubscriptionState(inMs(10 * DAY), now, 'pro').tier).toBe('pro')
    expect(computeSubscriptionState(inMs(-DAY), now, 'pro').tier).toBe('pro')
  })

  it('conta com data mas sem tipo gravado (liberada à mão) é Básico; tipo inválido também', () => {
    expect(computeSubscriptionState(inMs(10 * DAY), now).tier).toBe('basic')
    expect(computeSubscriptionState(inMs(10 * DAY), now, 'premium').tier).toBe('basic')
  })

  it('sem assinatura não tem tipo, mesmo que alguém passe um', () => {
    expect(computeSubscriptionState(null, now, 'pro').tier).toBeNull()
  })

  it('aceita a data como texto ISO (como vem do JSON)', () => {
    expect(computeSubscriptionState(inMs(10 * DAY).toISOString(), now).status).toBe('active')
  })
})

describe('dias de cada plano (dias fixos, não meses de calendário)', () => {
  it('1 mês = 30 dias, 3 = 90, 6 = 180 e 12 = 360', () => {
    expect(SUBSCRIPTION_PLAN_DAYS).toEqual({ 1: 30, 3: 90, 6: 180, 12: 360 })
    expect(subscriptionPlans('basic').map((p) => p.days)).toEqual([30, 90, 180, 360])
    expect(subscriptionPlans('pro').map((p) => p.days)).toEqual([30, 90, 180, 360])
  })
})

describe('addDays', () => {
  it('soma dias corridos de 24h', () => {
    expect(addDays(new Date('2026-10-30T10:00:00Z'), 30).toISOString()).toBe('2026-11-29T10:00:00.000Z')
    expect(addDays(new Date('2026-10-30T10:00:00Z'), 360).toISOString()).toBe('2027-10-25T10:00:00.000Z')
  })

  it('cruza fim de mês e de ano sem depender do calendário', () => {
    expect(addDays(new Date('2026-01-31T00:00:00Z'), 30).toISOString()).toBe('2026-03-02T00:00:00.000Z')
    expect(addDays(new Date('2026-12-20T00:00:00Z'), 30).toISOString()).toBe('2027-01-19T00:00:00.000Z')
  })

  it('não altera a data recebida', () => {
    const d = new Date('2026-10-30T00:00:00Z')
    addDays(d, 90)
    expect(d.toISOString()).toBe('2026-10-30T00:00:00.000Z')
  })
})

describe('applySubscriptionPurchase (troca de tipo não dá desconto e conta de hoje)', () => {
  const now = new Date('2026-10-30T12:00:00.000Z')
  const in10Days = new Date('2026-11-09T12:00:00.000Z')

  it('mesmo tipo ainda ativo: soma ao que sobrou', () => {
    const r = applySubscriptionPurchase({ endsAt: in10Days, tier: 'basic' }, { tier: 'basic', months: 1 }, now)
    expect(r).toMatchObject({ tier: 'basic', replacedActive: false })
    expect(r.endsAt.toISOString()).toBe('2026-12-09T12:00:00.000Z') // 10 dias que sobravam + 30
    expect(r.startedAt.toISOString()).toBe(in10Days.toISOString())
  })

  it('upgrade com tempo sobrando: o Pro começa HOJE e o que sobrava do Básico não é somado', () => {
    const r = applySubscriptionPurchase({ endsAt: in10Days, tier: 'basic' }, { tier: 'pro', months: 1 }, now)
    expect(r).toMatchObject({ tier: 'pro', replacedActive: true })
    expect(r.endsAt.toISOString()).toBe('2026-11-29T12:00:00.000Z') // hoje + 30 dias
    expect(r.startedAt.toISOString()).toBe(now.toISOString())
  })

  it('downgrade com tempo sobrando: mesma regra (começa hoje, sem crédito pelo Pro que sobrava)', () => {
    const r = applySubscriptionPurchase({ endsAt: new Date('2027-03-30T12:00:00Z'), tier: 'pro' }, { tier: 'basic', months: 3 }, now)
    expect(r).toMatchObject({ tier: 'basic', replacedActive: true })
    expect(r.endsAt.toISOString()).toBe('2027-01-28T12:00:00.000Z') // hoje + 90 dias
  })

  it('vencida, mesmo mudando de tipo: conta de agora e não há nada descartado', () => {
    const r = applySubscriptionPurchase({ endsAt: new Date('2026-01-01T00:00:00Z'), tier: 'pro' }, { tier: 'basic', months: 1 }, now)
    expect(r).toMatchObject({ replacedActive: false })
    expect(r.endsAt.toISOString()).toBe('2026-11-29T12:00:00.000Z')
  })

  it('sem assinatura: conta de agora', () => {
    const r = applySubscriptionPurchase({}, { tier: 'pro', months: 6 }, now)
    expect(r).toMatchObject({ tier: 'pro', replacedActive: false })
    expect(r.endsAt.toISOString()).toBe('2027-04-28T12:00:00.000Z') // hoje + 180 dias
  })

  it('conta ativa sem tipo gravado conta como Básico: renovar Básico soma, comprar Pro troca', () => {
    expect(applySubscriptionPurchase({ endsAt: in10Days }, { tier: 'basic', months: 1 }, now).replacedActive).toBe(false)
    expect(applySubscriptionPurchase({ endsAt: in10Days }, { tier: 'pro', months: 1 }, now).replacedActive).toBe(true)
  })
})

describe('subscriptionCheckoutSchema', () => {
  it('aceita um número inteiro de meses', () => {
    expect(() => subscriptionCheckoutSchema.parse({ months: 3 })).not.toThrow()
  })

  it('autoRenew é opcional e só aceita verdadeiro/falso', () => {
    expect(() => subscriptionCheckoutSchema.parse({ months: 3, autoRenew: true })).not.toThrow()
    expect(() => subscriptionCheckoutSchema.parse({ months: 3, autoRenew: false })).not.toThrow()
    expect(() => subscriptionCheckoutSchema.parse({ months: 3 })).not.toThrow()
    expect(() => subscriptionCheckoutSchema.parse({ months: 3, autoRenew: 'sim' })).toThrow()
  })

  it('o tipo é opcional e só aceita basic ou pro', () => {
    expect(() => subscriptionCheckoutSchema.parse({ months: 3, tier: 'pro' })).not.toThrow()
    expect(() => subscriptionCheckoutSchema.parse({ months: 3, tier: 'basic' })).not.toThrow()
    expect(() => subscriptionCheckoutSchema.parse({ months: 3, tier: 'premium' })).toThrow()
  })

  it('recusa o que não é número inteiro ou está fora da faixa', () => {
    expect(() => subscriptionCheckoutSchema.parse({ months: 1.5 })).toThrow()
    expect(() => subscriptionCheckoutSchema.parse({ months: 0 })).toThrow()
    expect(() => subscriptionCheckoutSchema.parse({})).toThrow()
  })
})
