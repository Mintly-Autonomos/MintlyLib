import {
  SettlementRule,
  SettlementRuleKind,
  describeSettlementRule,
  resolveSettlementRule,
  settlementDueDate,
  settlementRuleSchema,
  validateSettlementRule,
} from './settlement-rule'

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
const due = (rule: SettlementRule, sale: string) => settlementDueDate(rule, day(sale))?.toISOString().slice(0, 10)

// 2026-11-02 é uma segunda-feira.
const quarta: SettlementRule = { kind: SettlementRuleKind.Weekly, weekday: 3 }

describe('settlementDueDate — toda semana (exemplo do dono: iFood/Keeta pagam na quarta)', () => {
  it('venda na terça cai no dia seguinte, quarta', () => {
    expect(due(quarta, '2026-11-03')).toBe('2026-11-04')
  })

  it('venda na quarta só cai na quarta da semana seguinte', () => {
    expect(due(quarta, '2026-11-04')).toBe('2026-11-11')
  })

  it.each([
    ['2026-11-02', '2026-11-04'], // segunda
    ['2026-11-05', '2026-11-11'], // quinta
    ['2026-11-06', '2026-11-11'], // sexta
    ['2026-11-07', '2026-11-11'], // sábado
    ['2026-11-08', '2026-11-11'], // domingo
  ])('venda em %s cai em %s', (sale, expected) => {
    expect(due(quarta, sale)).toBe(expected)
  })

  it('domingo e sábado também funcionam como dia de repasse', () => {
    expect(due({ kind: SettlementRuleKind.Weekly, weekday: 0 }, '2026-11-07')).toBe('2026-11-08')
    expect(due({ kind: SettlementRuleKind.Weekly, weekday: 6 }, '2026-11-07')).toBe('2026-11-14')
  })

  it('atravessa a virada de mês e de ano', () => {
    expect(due(quarta, '2026-12-30')).toBe('2027-01-06')
  })

  it('ignora a hora da venda: vale o dia do calendário', () => {
    const sale = new Date('2026-11-03T21:30:00.000Z')
    expect(settlementDueDate(quarta, sale)?.toISOString()).toBe('2026-11-04T00:00:00.000Z')
  })
})

describe('settlementDueDate — duas vezes por mês', () => {
  const dias5e20: SettlementRule = { kind: SettlementRuleKind.Biweekly, firstDay: 5, secondDay: 20 }

  it.each([
    ['2026-11-01', '2026-11-05'],
    ['2026-11-04', '2026-11-05'],
    ['2026-11-05', '2026-11-20'], // venda no dia de repasse espera o próximo
    ['2026-11-19', '2026-11-20'],
    ['2026-11-20', '2026-12-05'],
    ['2026-11-30', '2026-12-05'],
    ['2026-12-31', '2027-01-05'],
  ])('venda em %s cai em %s', (sale, expected) => {
    expect(due(dias5e20, sale)).toBe(expected)
  })

  it('a ordem em que os dias foram escolhidos não importa', () => {
    expect(due({ kind: SettlementRuleKind.Biweekly, firstDay: 20, secondDay: 5 }, '2026-11-10')).toBe('2026-11-20')
  })

  it('dia 31 num mês curto cai no último dia do mês', () => {
    const rule: SettlementRule = { kind: SettlementRuleKind.Biweekly, firstDay: 15, secondDay: 31 }
    expect(due(rule, '2026-02-16')).toBe('2026-02-28')
    expect(due(rule, '2028-02-16')).toBe('2028-02-29') // bissexto
  })
})

describe('settlementDueDate — uma vez por mês', () => {
  const dia10: SettlementRule = { kind: SettlementRuleKind.Monthly, day: 10 }

  it.each([
    ['2026-11-02', '2026-11-10'],
    ['2026-11-09', '2026-11-10'],
    ['2026-11-10', '2026-12-10'],
    ['2026-11-25', '2026-12-10'],
    ['2026-12-25', '2027-01-10'],
  ])('venda em %s cai em %s', (sale, expected) => {
    expect(due(dia10, sale)).toBe(expected)
  })

  it('dia 31 acompanha o tamanho do mês', () => {
    const fim: SettlementRule = { kind: SettlementRuleKind.Monthly, day: 31 }
    expect(due(fim, '2026-01-15')).toBe('2026-01-31')
    expect(due(fim, '2026-01-31')).toBe('2026-02-28')
    expect(due(fim, '2026-04-10')).toBe('2026-04-30')
  })
})

describe('settlementDueDate — N dias após a venda', () => {
  it('soma os dias corridos', () => {
    expect(due({ kind: SettlementRuleKind.AfterDays, days: 7 }, '2026-11-02')).toBe('2026-11-09')
    expect(due({ kind: SettlementRuleKind.AfterDays, days: 1 }, '2026-11-30')).toBe('2026-12-01')
  })

  it('0 dias cai na hora: sem vencimento', () => {
    expect(settlementDueDate({ kind: SettlementRuleKind.AfterDays, days: 0 }, day('2026-11-02'))).toBeNull()
  })

  it('mantém a hora da venda (comportamento de sempre)', () => {
    const sale = new Date('2026-11-02T15:00:00.000Z')
    expect(settlementDueDate({ kind: SettlementRuleKind.AfterDays, days: 2 }, sale)?.toISOString()).toBe(
      '2026-11-04T15:00:00.000Z',
    )
  })
})

describe('resolveSettlementRule', () => {
  it('usa a regra quando existe', () => {
    expect(resolveSettlementRule({ settlementRule: quarta, settlementDays: 3 })).toEqual(quarta)
  })

  it('conta antiga: settlementDays vira "N dias após a venda"', () => {
    expect(resolveSettlementRule({ settlementDays: 7 })).toEqual({ kind: SettlementRuleKind.AfterDays, days: 7 })
    expect(resolveSettlementRule({ settlementDays: 0 })).toEqual({ kind: SettlementRuleKind.AfterDays, days: 0 })
  })

  it('sem nada: null', () => {
    expect(resolveSettlementRule({})).toBeNull()
    expect(resolveSettlementRule({ settlementRule: null, settlementDays: null })).toBeNull()
  })
})

describe('validateSettlementRule', () => {
  it('quinzenal com o mesmo dia duas vezes é recusado', () => {
    expect(validateSettlementRule({ kind: SettlementRuleKind.Biweekly, firstDay: 10, secondDay: 10 })).toMatch(/dois dias diferentes/)
  })

  it('as demais passam', () => {
    expect(validateSettlementRule(quarta)).toBeNull()
    expect(validateSettlementRule({ kind: SettlementRuleKind.Biweekly, firstDay: 5, secondDay: 20 })).toBeNull()
  })
})

describe('settlementRuleSchema', () => {
  it.each([
    { kind: 'afterDays', days: 7 },
    { kind: 'weekly', weekday: 3 },
    { kind: 'biweekly', firstDay: 5, secondDay: 20 },
    { kind: 'monthly', day: 10 },
  ])('aceita %j', (rule) => {
    expect(settlementRuleSchema.safeParse(rule).success).toBe(true)
  })

  it.each([
    { kind: 'weekly', weekday: 7 },
    { kind: 'weekly', weekday: -1 },
    { kind: 'monthly', day: 0 },
    { kind: 'monthly', day: 32 },
    { kind: 'biweekly', firstDay: 5 },
    { kind: 'afterDays', days: -1 },
    { kind: 'afterDays', days: 1.5 },
    { kind: 'daily' },
    { kind: 'weekly' },
  ])('recusa %j', (rule) => {
    expect(settlementRuleSchema.safeParse(rule).success).toBe(false)
  })
})

describe('describeSettlementRule', () => {
  it.each([
    [{ kind: SettlementRuleKind.Weekly, weekday: 3 }, 'Toda quarta-feira'],
    [{ kind: SettlementRuleKind.Weekly, weekday: 0 }, 'Todo domingo'],
    [{ kind: SettlementRuleKind.Weekly, weekday: 6 }, 'Todo sábado'],
    [{ kind: SettlementRuleKind.Biweekly, firstDay: 20, secondDay: 5 }, 'Dias 5 e 20 de cada mês'],
    [{ kind: SettlementRuleKind.Monthly, day: 10 }, 'Todo dia 10 do mês'],
    [{ kind: SettlementRuleKind.AfterDays, days: 7 }, '7 dias após a venda'],
    [{ kind: SettlementRuleKind.AfterDays, days: 1 }, '1 dia após a venda'],
    [{ kind: SettlementRuleKind.AfterDays, days: 0 }, 'No mesmo dia da venda'],
  ] as [SettlementRule, string][])('%j -> %s', (rule, text) => {
    expect(describeSettlementRule(rule)).toBe(text)
  })
})
