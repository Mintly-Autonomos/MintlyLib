import type { MovementDirection, MovementStatus } from '../financial/financial-movement-schema'

/**
 * Contrato de GET /reports/cash-flow (fatia 2, MIN-94). Número cru e data
 * `AAAA-MM-DD` no fuso America/Sao_Paulo — formatação é do front (D6).
 * Spec: MintlyApi/specs/modulos-novos/20261012/fluxo-de-caixa.md.
 */

/** Query: horizonte em dias, 1 a 365. Padrão 30 no servidor. */
export interface CashFlowQuery {
  horizon?: number
}

/** Um dia da série: saldo no FIM do dia e o que entrou/saiu nele. */
export interface DailyPoint {
  date: string
  balance: number
  inflows: number
  outflows: number
}

/** Bloco de 7 dias a partir de hoje (o último pode ser menor). */
export interface CashFlowWeek {
  from: string
  to: string
  inflows: number
  outflows: number
}

/** Movimentação COM vencimento na janela do relatório. */
export interface DueItem {
  id: string
  title: string
  category: { _id: string; name: string }
  direction: MovementDirection
  /** Entrada: netValue; saída: grossValue — a mesma regra do saldo. */
  amount: number
  dueDate: string
  status: MovementStatus.Pending | MovementStatus.Settled
  /** Pendente com vencimento antes de hoje. */
  overdue: boolean
  /** Só em liquidada: quando o dinheiro mexeu. */
  settledAt?: string
  /** `platformPayout`: pedidos de uma conta de plataforma agrupados por data de repasse. */
  kind?: 'movement' | 'platformPayout'
  /** Quantos lançamentos o item representa (1 em `movement`). */
  itemCount?: number
}

/** Primeiro dia da projeção com saldo abaixo da margem de segurança. */
export interface CriticalDayInsight {
  kind: 'criticalDay'
  severity: 'warning'
  date: string
  balance: number
  threshold: number
}

/** Blocos determinísticos (design 1.4). Novos tipos entram nesta união. */
export type CashFlowInsight = CriticalDayInsight

export interface CashFlowReport {
  horizon: number
  today: string
  /** Σ availableBalance das contas ativas. */
  cashToday: number
  /** Entradas pendentes até o fim do horizonte, vencidas incluídas. */
  receivable: number
  /** Saídas pendentes até o fim do horizonte, vencidas incluídas. */
  payable: number
  /** cashToday + receivable − payable = saldo do último ponto da projeção. */
  projectedBalance: number
  lowestBalance: { date: string; balance: number }
  overdue: { count: number; receivable: number; payable: number }
  safetyThreshold: { value: number; days: number; avgDailyOutflow: number }
  /** Hoje até hoje + horizon (horizon + 1 pontos). */
  projection: DailyPoint[]
  /** Os 7 dias anteriores a hoje, do mais antigo para o mais recente. */
  realized: DailyPoint[]
  weeks: CashFlowWeek[]
  dueItems: DueItem[]
  insights: CashFlowInsight[]
}
