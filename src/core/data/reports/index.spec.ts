import type * as reports from './index'

// Contrato só de tipos: o teste é o typecheck destas atribuições.
describe('barrel de reports', () => {
  it('exporta os tipos de Custos & Despesas (fatias 6 e 7)', () => {
    const sub: reports.ExpenseSubitem = { key: 'none', subcategoryId: null, name: 'Sem subitem', amount: 1, previous: 0, average3: null, deltaPrevious: null, deltaAverage3: null, anomaly: false }
    const item: reports.ExpenseItem = {
      key: 'c1',
      kind: 'category',
      categoryId: 'c1',
      name: 'CMV',
      behavior: 'variable' as any,
      dreGroup: 'cmv' as any,
      amount: 1,
      previous: 0,
      average3: null,
      deltaPrevious: null,
      deltaAverage3: null,
      pctOfRevenue: null,
      subitems: [sub],
      hasAnomaly: false,
      history: [{ month: '2026-08', amount: 1 }],
      projected: null,
    }
    const anomaly: reports.ExpenseAnomaly = { itemKey: 'c1', categoryId: 'c1', categoryName: 'CMV', subcategoryId: null, subitemKey: 'none', name: 'Sem subitem', amount: 300, average3: 100, excess: 200, pctAbove: 2 }
    const rule: reports.ExpensesAnomalyRule = { minPctAbove: 0.5, minExcess: 100, minHistoryMonths: 2 }
    const projection: reports.ExpensesProjection = { total: 10, revenue: 20, elapsedDays: 10, daysInMonth: 31 }
    const query: reports.ExpensesQuery = { month: '2026-08' }
    expect([item.subitems[0]?.key, anomaly.excess, rule.minExcess, projection.daysInMonth, query.month]).toEqual(['none', 200, 100, 31, '2026-08'])
  })

  it('exporta os tipos da Visão Geral (fatia 8)', () => {
    const pillar: reports.HealthPillar = { key: 'runway', weight: 0.3, score: 44.4, value: 20 }
    const insight: reports.OverviewInsight = { kind: 'breakEvenReached', severity: 'positive', day: 19 }
    const label: reports.HealthLabel = 'noData'
    const query: reports.OverviewQuery = { month: '2026-07' }
    expect([pillar.key, insight.kind, label, query.month]).toEqual(['runway', 'breakEvenReached', 'noData', '2026-07'])
  })
})
