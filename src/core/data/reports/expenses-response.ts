import type { CategoryBehavior, DreGroup } from '../financial/financial-category-schema'
import type { MovementChannel } from '../financial/financial-movement-schema'

/**
 * Contrato de GET /reports/expenses (fatia 6). Por competência; número cru;
 * percentuais e variações como fração (0.311 = 31,1%). Spec:
 * MintlyApi/specs/modulos-novos/20261013/custos-despesas.md.
 */

/** `month` em AAAA-MM (padrão: mês corrente). Sem `channel` = Geral. */
export interface ExpensesQuery {
  month?: string
  channel?: MovementChannel.DineIn | MovementChannel.Delivery
}

export type ExpenseItemKind = 'category' | 'platformFee'

/** Subitem de uma categoria (fatia 7): uma subcategoria, ou "Sem subitem" (`key: 'none'`). */
export interface ExpenseSubitem {
  key: string
  subcategoryId: string | null
  /** Nome atual da subcategoria (mesmo inativa); "Sem subitem". */
  name: string
  amount: number
  previous: number
  average3: number | null
  deltaPrevious: number | null
  deltaAverage3: number | null
  anomaly: boolean
}

/** Linha de "Para onde está indo seu dinheiro": categoria ou taxa de uma conta de plataforma. */
export interface ExpenseItem {
  /** categoryId, ou `platformFee:<accountId>`. */
  key: string
  kind: ExpenseItemKind
  categoryId: string | null
  name: string
  behavior: CategoryBehavior
  dreGroup: DreGroup | null
  amount: number
  previous: number
  /** Média de M−1..M−3 (desde o primeiro lançamento); `null` sem mês elegível. */
  average3: number | null
  deltaPrevious: number | null
  deltaAverage3: number | null
  pctOfRevenue: number | null
  /** [] quando a categoria não tem lançamento com subcategoria na janela; taxa → []. */
  subitems: ExpenseSubitem[]
  /** Selo "alerta": a categoria inteira ou algum subitem dela é atípico no mês. */
  hasAnomaly: boolean
  /** 6 meses, do mais antigo ao mês de referência (gráfico "Por categoria"). */
  history: { month: string; amount: number }[]
  /** Projeção do mês atual; null em mês fechado. */
  projected: number | null
}

export interface ExpensesTotal {
  current: number
  previous: number
  average3: number | null
  deltaPrevious: number | null
  deltaAverage3: number | null
}

export interface ExpensesPlatformFee {
  amount: number
  previous: number
  deltaPrevious: number | null
  /** Σ receita bruta de canal efetivo delivery no mês. */
  deliveryRevenue: number
  /** Taxa / Σ receita bruta das contas de plataforma (a taxa e a venda que a gerou no mesmo denominador). */
  pctOfDelivery: number | null
}

/** Gasto atípico do mês ("Fique de olho"). Regra em `ExpensesReport.anomalyRule`. */
export interface ExpenseAnomaly {
  /** `ExpenseItem.key` da categoria. */
  itemKey: string
  categoryId: string | null
  categoryName: string
  subcategoryId: string | null
  /** `ExpenseSubitem.key`; null = a categoria inteira foi avaliada (sem subitens). */
  subitemKey: string | null
  name: string
  amount: number
  average3: number
  excess: number
  pctAbove: number
}

/** Projeção linear do mês atual: total até hoje × daysInMonth / elapsedDays. */
export interface ExpensesProjection {
  total: number
  elapsedDays: number
  daysInMonth: number
}

/** Critério de anomalia (N4 — palpite, ainda não validado pelo negócio). */
export interface ExpensesAnomalyRule {
  minPctAbove: number
  minExcess: number
  minHistoryMonths: number
}

export interface ExpensesReport {
  referenceMonth: string
  previousMonth: string
  channel: MovementChannel | null
  revenue: { current: number; previous: number }
  total: ExpensesTotal
  cmv: { amount: number; pctOfRevenue: number | null; target: { min: number; max: number } }
  primeCost: { amount: number; cmv: number; labor: number; pctOfRevenue: number | null; targetMax: number }
  platformFee: ExpensesPlatformFee
  /** Misto separado (a tela mostra "Misto"). */
  byBehavior: { fixed: number; variable: number; mixed: number }
  items: ExpenseItem[]
  /** Só com `channel`: Σ saídas de canal efetivo `shared` que ficaram de fora. */
  sharedExcluded: number | null
  /** 6 meses, do mais antigo ao mês de referência. */
  history: { month: string; total: number }[]
  /** Maior excedente primeiro. Só o mês de referência. */
  anomalies: ExpenseAnomaly[]
  /** Só quando o mês de referência é o mês atual. */
  projection: ExpensesProjection | null
  anomalyRule: ExpensesAnomalyRule
}
