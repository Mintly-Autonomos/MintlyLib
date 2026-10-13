import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { OverviewQuery, OverviewReport } from '../core/data/reports/overview-response'

/**
 * Visão Geral (fatia 8) — rota própria em /dashboard. Só GET; compõe o
 * HttpBaseClient pela conexão, como o ReportClient.
 */
export class DashboardClient {
  private readonly http = new HttpBaseClient<OverviewReport>('dashboard')

  /** Cards, score de saúde, "O que fazer primeiro", Receita × Despesa e cascata do lucro. */
  async overview (query: OverviewQuery, headers: Headers): Promise<ResponseDto<OverviewReport>> {
    const response = await this.http.connection.get<ResponseDto<OverviewReport>>('/overview', withHeaders(headers, { params: query }))
    return response.data
  }
}
