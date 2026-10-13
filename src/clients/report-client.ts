import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { CashFlowQuery, CashFlowReport } from '../core/data/reports/cash-flow-response'
import type { ResultQuery, ResultReport } from '../core/data/reports/result-response'

/**
 * Relatórios de leitura (módulos novos). Só GETs próprios — compõe o
 * HttpBaseClient pela conexão, como o FinancialMovementClient. As próximas
 * fatias (result, expenses) entram aqui como métodos.
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
}
