import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type {
  AiInsightsRequest,
  AiInsightsResponse,
  AiPriceSuggestion,
  AiPriceSuggestionRequest,
  AiUsage,
} from '../core/data/ai/ai-schema'

/**
 * IA do Mintly: textos dos cards e sugestão de preço. COMPÕE o HttpBaseClient (só expõe o que as rotas têm).
 * Restaurante e usuário vêm do token; os dados que a IA lê são montados no servidor. Quando o limite do dia acaba a
 * API responde 429, e quando a IA está fora do ar, 503: o front mantém o texto pronto de sempre.
 */
export class AiClient {
  private readonly http = new HttpBaseClient<unknown>('ai')

  /** Quantas chamadas à IA o restaurante já fez hoje e quantas restam. Não gasta chamada. */
  async usage (headers: Headers): Promise<ResponseDto<AiUsage>> {
    const response = await this.http.connection.get<ResponseDto<AiUsage>>('/usage', withHeaders(headers))
    return response.data
  }

  /** Reescreve o título e a descrição dos insights da tela, adaptados ao restaurante. */
  async insights (body: AiInsightsRequest, headers: Headers): Promise<ResponseDto<AiInsightsResponse>> {
    const response = await this.http.connection.post<ResponseDto<AiInsightsResponse>>('/insights', body, withHeaders(headers))
    return response.data
  }

  /** Sugere o aumento ideal do preço de um prato (sem `menuItemId`, o que está há mais tempo sem mudar). */
  async priceSuggestion (body: AiPriceSuggestionRequest, headers: Headers): Promise<ResponseDto<AiPriceSuggestion>> {
    const response = await this.http.connection.post<ResponseDto<AiPriceSuggestion>>('/price-suggestion', body, withHeaders(headers))
    return response.data
  }
}
