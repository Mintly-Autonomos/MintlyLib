import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { CashFlowQuery, CashFlowReport } from '../core/data/reports/cash-flow-response'
import type { ResultQuery, ResultReport } from '../core/data/reports/result-response'
import type { ExpensesQuery, ExpensesReport } from '../core/data/reports/expenses-response'

/**
 * Relatórios de leitura (módulos novos). Só GETs próprios — compõe o
 * HttpBaseClient pela conexão, como o FinancialMovementClient. A Visão Geral
 * entra aqui como método.
 */
export class ReportClient {
  private readonly http = new HttpBaseClient<CashFlowReport>('reports')

  /** Fluxo de Caixa: caixa hoje, projeção no horizonte, vencimentos e dia crítico. */
  async cashFlow (query: CashFlowQuery, headers: Headers): Promise<ResponseDto<CashFlowReport>> {
    const response = await this.http.connection.get<ResponseDto<CashFlowReport>>('/cash-flow', withHeaders(headers, { params: query }))
    return response.data
  }

  /** Resultado (DRE) do mês: linhas, composição, ponto de equilíbrio, histórico e insights. */
  async result (query: ResultQuery, headers: Headers): Promise<ResponseDto<ResultReport>> {
    const response = await this.http.connection.get<ResponseDto<ResultReport>>('/result', withHeaders(headers, { params: query }))
    return response.data
  }

  /** Custos & Despesas do mês (fatia A): total, CMV, prime cost, taxa de plataforma e categorias. */
  async expenses (query: ExpensesQuery, headers: Headers): Promise<ResponseDto<ExpensesReport>> {
    const response = await this.http.connection.get<ResponseDto<ExpensesReport>>('/expenses', withHeaders(headers, { params: query }))
    return response.data
  }
}
