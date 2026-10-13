import type { CategoryBehavior } from '../financial/financial-category-schema'
import type { TaxRegime } from '../restaurant/restaurant-schema'

/**
 * Contrato de GET /reports/result (fatia 4). DRE simplificado por competência.
 * Número cru; taxas e margens como fração (0.109 = 10,9%). Spec:
 * MintlyApi/specs/modulos-novos/20261012/resultado-dre.md.
 */

/** `month` em AAAA-MM; padrão o mês corrente no servidor. */
export interface ResultQuery {
  month?: string
}

export interface ResultLines {
  grossRevenue: number
  taxes: number
  netRevenue: number
  cmv: number
  grossMargin: number
  operatingExpenses: number
  netProfit: number
  netMargin: number | null
}

export type ResultLineKey = Exclude<keyof ResultLines, 'netMargin'>

/** Item da composição das despesas operacionais (categoria ou a taxa de plataforma). */
export interface OpexItem {
  categoryId: string | null
  name: string
  kind: 'labor' | 'opex' | 'platformFee'
  behavior: CategoryBehavior
  amount: number
  previousAmount: number
  delta: number | null
  revenuePct: number | null
}

export type ResultInsight =
  | { kind: 'profitChanged'; severity: 'positive' | 'warning'; difference: number; previousProfit: number; currentProfit: number; previousMargin: number | null; currentMargin: number | null }
  | { kind: 'largestOpexItem'; severity: 'warning'; name: string; amount: number; revenuePct: number | null }
  | { kind: 'taxRegimeNotConfigured'; severity: 'info' }

export interface ResultBreakEven {
  fixedCosts: number
  variableCosts: number
  contributionMarginPct: number | null
  breakEvenRevenue: number | null
  reachedOnDay: number | null
}

export interface ResultHistoryPoint {
  month: string
  grossRevenue: number
  netProfit: number
  netMargin: number | null
}

export interface ResultReport {
  referenceMonth: string
  previousMonth: string
  current: ResultLines
  previous: ResultLines
  deltas: Record<ResultLineKey, number | null>
  tax: { regime: TaxRegime | null; effectiveRate: number | null; meiMonthlyDas: number | null }
  operatingExpenseItems: OpexItem[]
  breakEven: ResultBreakEven
  history: ResultHistoryPoint[]
  insights: ResultInsight[]
}
