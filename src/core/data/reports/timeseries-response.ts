/**
 * Série temporal dos relatórios (relatório Sweetie Bel, P.3 / 12.4): o mesmo seletor Dia / Semana / Mês / Ano nos
 * gráficos do Resultado, de Custos e do Fluxo de caixa.
 *
 * - `day`: um ponto por dia (no máximo `TIMESERIES_MAX_DAYS`);
 * - `week`: um ponto por semana, de segunda a domingo (no máximo `TIMESERIES_MAX_WEEKS`);
 * - `month`: um ponto por mês (no máximo `TIMESERIES_MAX_MONTHS`). Com `compare=previousYear`, vem também o mesmo
 *   mês do ano anterior de cada ponto (é o "Ano" do seletor: dez/25 × dez/26).
 *
 * Receita, custos, imposto e lucro são pela data da VENDA/despesa (competência, como o Resultado); `cashIn` e
 * `cashOut` são pela data do dinheiro (como o Fluxo de caixa). O imposto do mês é repartido entre os dias/semanas
 * pela receita de cada um. Transferência entre contas, saldo inicial e não operacional ficam de fora do lucro.
 */
export type TimeseriesGranularity = 'day' | 'week' | 'month'

export const TIMESERIES_MAX_DAYS = 90
export const TIMESERIES_MAX_WEEKS = 52
export const TIMESERIES_MAX_MONTHS = 12

/** Query de GET /reports/timeseries. `points` = quantos pontos até hoje (padrão: 30 dias, 12 semanas ou 12 meses). */
export interface TimeseriesQuery {
  granularity: TimeseriesGranularity
  points?: number
  compare?: 'previousYear'
}

export interface TimeseriesPoint {
  /** Início do balde: "AAAA-MM-DD" (dia ou segunda-feira da semana) ou "AAAA-MM" (mês). */
  key: string
  /** Último dia do balde, "AAAA-MM-DD". */
  end: string
  revenue: number
  cmv: number
  /** Outras despesas operacionais (pessoal, aluguel, taxas…), sem o CMV. */
  expenses: number
  taxes: number
  /** revenue − taxes − cmv − expenses. */
  profit: number
  /** Dinheiro que entrou e saiu (liquidado) no balde, com o não operacional. */
  cashIn: number
  cashOut: number
}

export interface TimeseriesReport {
  granularity: TimeseriesGranularity
  points: TimeseriesPoint[]
  /** Só com `compare=previousYear` e granularidade mês: o mesmo mês do ano anterior de cada ponto (mesma ordem). */
  previousYear: TimeseriesPoint[] | null
}
