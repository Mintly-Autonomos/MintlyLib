import type { CategoryBehavior } from '../financial/financial-category-schema'
import type { TaxRegime } from '../restaurant/restaurant-schema'

/**
 * Contrato de GET /reports/result (fatia 4). DRE simplificado por competência.
 * Número cru; taxas e margens como fração (0.109 = 10,9%). Spec:
 * MintlyApi/specs/modulos-novos/20261012/resultado-dre.md.
 */

/**
 * Base das comparações (ajustes, item 1). No mês atual (`samePeriod`) "vs. mês
 * anterior" e "vs. média" usam os mesmos dias (1..`untilDay`) dos meses
 * anteriores; mês fechado (`fullMonth`) compara meses cheios.
 */
export interface ReportComparison {
  kind: 'samePeriod' | 'fullMonth'
  untilDay: number | null
}

/** Meses do histórico (`history`) do Resultado: 6 (padrão) ou 12. */
export type ResultHistoryMonths = 6 | 12

/**
 * `month` em AAAA-MM; padrão o mês corrente no servidor. No Resultado pode ser um mês **futuro**
 * (até 12 meses à frente): mostra só o que já está lançado com competência naquele mês.
 */
export interface ResultQuery {
  month?: string
  historyMonths?: ResultHistoryMonths
}

/**
 * Linhas do DRE gerencial. Tudo até `netProfit` é OPERACIONAL: categorias com Natureza "Não operacional"
 * (empréstimo recebido, aporte, saldo inicial, equipamento, parcelas, juros) ficam fora da receita e das
 * despesas e aparecem só nas linhas `nonOperating*`, depois do resultado.
 */
export interface ResultLines {
  grossRevenue: number
  taxes: number
  netRevenue: number
  cmv: number
  grossMargin: number
  operatingExpenses: number
  /** Resultado operacional: o "lucro do mês". */
  netProfit: number
  netMargin: number | null
  /** Entradas de categorias "Não operacional" (empréstimo, aporte, saldo inicial...). */
  nonOperatingIncome: number
  /** Saídas de categorias "Não operacional" (equipamento, parcelas, juros...). */
  nonOperatingExpenses: number
  /** Resultado operacional + entradas − saídas não operacionais: quanto o mês mexeu no dinheiro, por competência. */
  resultAfterNonOperating: number
}

export type ResultLineKey = Exclude<keyof ResultLines, 'netMargin'>

/**
 * Item da composição das despesas operacionais: categoria, comissão dos apps de delivery (`platformFee`)
 * ou taxa da maquininha (`cardFee`, S3.3).
 */
export interface OpexItem {
  categoryId: string | null
  name: string
  kind: 'labor' | 'opex' | 'platformFee' | 'cardFee'
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
  /** Sobre a receita líquida: (líquida − variáveis) / líquida. */
  contributionMarginPct: number | null
  /** Receita BRUTA do mês que paga os custos fixos — o que o dono compara com o que vende. */
  breakEvenRevenue: number | null
  reachedOnDay: number | null
}

export interface ResultHistoryPoint {
  month: string
  grossRevenue: number
  netProfit: number
  netMargin: number | null
}

/**
 * O mesmo mês do ano anterior (nov/25 × nov/26): leitura natural para negócio sazonal.
 * `deltas` = variação do mês atual sobre esse mês (mesma regra de `ResultReport.deltas`; no mês em
 * andamento compara os mesmos dias, 1..`comparison.untilDay`).
 */
export interface ResultPreviousYear {
  month: string
  lines: ResultLines
  deltas: Record<ResultLineKey, number | null>
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
  comparison: ReportComparison
  /** null = nenhum lançamento no mesmo mês do ano anterior (nada a comparar). */
  previousYear: ResultPreviousYear | null
}
