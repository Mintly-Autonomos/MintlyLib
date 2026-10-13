import type * as reports from './index'

// Contrato só de tipos: o teste é o typecheck destas atribuições.
describe('barrel de reports', () => {
  it('exporta os tipos de Custos & Despesas', () => {
    const item: reports.ExpenseItem = { key: 'c1', kind: 'category', categoryId: 'c1', name: 'CMV', behavior: 'variable' as any, dreGroup: 'cmv' as any, amount: 1, previous: 0, average3: null, deltaPrevious: null, deltaAverage3: null, pctOfRevenue: null }
    const query: reports.ExpensesQuery = { month: '2026-08' }
    expect(item.kind).toBe('category')
    expect(query.month).toBe('2026-08')
  })
})
