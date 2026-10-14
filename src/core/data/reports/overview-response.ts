/**
 * Contrato de GET /dashboard/overview (fatia 8). Composição dos relatórios do
 * mês (DRE, Custos) e de hoje (Fluxo de Caixa). Frações como no resto
 * (0.36 = 36%); `deltaPoints` em pontos percentuais (2.8 = +2,8 p.p.). Spec:
 * MintlyApi/specs/modulos-novos/20261013/visao-geral.md.
 */

import type { ReportComparison } from './result-response'

/** `month` em AAAA-MM (padrão: mês corrente). Os blocos de caixa são sempre de hoje. */
export interface OverviewQuery {
  month?: string
}

export interface OverviewCards {
  netProfit: { amount: number; delta: number | null; history: { month: string; amount: number }[] }
  revenue: { amount: number; delta: number | null; history: { month: string; amount: number }[] }
  cashToday: { amount: number; realized: { date: string; balance: number }[] }
  /** `runwayDays`: fôlego — caixa de hoje ÷ despesa média diária (dias inteiros). */
  projection: { horizon: number; balance: number; lowest: { date: string; balance: number }; runwayDays: number | null }
  cmv: { pct: number | null; previousPct: number | null; deltaPoints: number | null; target: { min: number; max: number } }
  primeCost: { pct: number | null; previousPct: number | null; deltaPoints: number | null; targetMax: number }
}

export type HealthLabel = 'risk' | 'attention' | 'healthy' | 'noData'
export type HealthPillarKey = 'netMargin' | 'runway' | 'primeCost' | 'revenueTrend'

/** Pilar do score (N5 — palpite). `score` null = sem dado (fora da média). */
export interface HealthPillar {
  key: HealthPillarKey
  weight: number
  score: number | null
  value: number | null
}

export interface OverviewHealth {
  score: number | null
  label: HealthLabel
  /**
   * Mês dos pilares do mês. Mês atual: o último mês fechado (+ fôlego de hoje).
   * Mês passado: o próprio mês, sem o fôlego (pilar `runway` sem dado).
   */
  basisMonth: string
  pillars: HealthPillar[]
  bands: { risk: number; attention: number }
}

export type OverviewInsight =
  | { kind: 'cashTight'; severity: 'warning'; date: string; balance: number }
  /** `basisMonth`: mês avaliado — no mês atual, o último mês fechado (mesma base do score). */
  | { kind: 'cmvAboveTarget'; severity: 'warning'; pct: number; targetMax: number; impact: number; basisMonth: string }
  | { kind: 'primeCostAboveTarget'; severity: 'warning'; pct: number; targetMax: number; basisMonth: string }
  | { kind: 'expenseAnomaly'; severity: 'warning'; name: string; categoryName: string; excess: number; pctAbove: number }
  | { kind: 'breakEvenReached'; severity: 'positive'; day: number }
  | { kind: 'taxRegimeNotConfigured'; severity: 'info' }

export interface RevenueVsExpensePoint {
  month: string
  revenue: number
  expense: number
  /** true = projeção linear do mês atual (o ponto real do mesmo mês vem antes). */
  projected: boolean
}

export interface ProfitWaterfall {
  grossRevenue: number
  taxes: number
  cmv: number
  operatingExpenses: number
  netProfit: number
}

export interface OverviewReport {
  referenceMonth: string
  /** AAAA-MM-DD em SP — referência dos blocos de caixa. */
  today: string
  cards: OverviewCards
  health: OverviewHealth
  /** No máximo 4: warning → positive → info. */
  insights: OverviewInsight[]
  revenueVsExpense: RevenueVsExpensePoint[]
  profitWaterfall: ProfitWaterfall
  /** Base das variações dos cards (mesmo período no mês atual). */
  comparison: ReportComparison
}
