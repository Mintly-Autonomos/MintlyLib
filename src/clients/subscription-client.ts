import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type {
  SubscriptionCancelRenewalResponse,
  SubscriptionCheckoutRequest,
  SubscriptionCheckoutResponse,
  SubscriptionMockDecision,
  SubscriptionOverview,
} from '../core/data/subscription/subscription'

/**
 * Assinatura do restaurante do usuário autenticado. COMPÕE o HttpBaseClient (como Restaurant): só
 * expõe o que a rota tem. Estas rotas funcionam MESMO sem assinatura válida (é por elas que a pessoa
 * assina); todas as demais respondem 402 enquanto não houver assinatura.
 */
export class SubscriptionClient {
  private readonly http = new HttpBaseClient<unknown>('subscription')

  /** Estado da assinatura + planos/preços + provedor de pagamento. */
  async overview (headers: Headers): Promise<ResponseDto<SubscriptionOverview>> {
    const response = await this.http.connection.get<ResponseDto<SubscriptionOverview>>('/', withHeaders(headers))
    return response.data
  }

  /** Cria a cobrança do plano e devolve para onde levar a pessoa pagar. */
  async checkout (body: SubscriptionCheckoutRequest, headers: Headers): Promise<ResponseDto<SubscriptionCheckoutResponse>> {
    const response = await this.http.connection.post<ResponseDto<SubscriptionCheckoutResponse>>('/checkout', body, withHeaders(headers))
    return response.data
  }

  /** Cancela a renovação automática. O acesso continua até a data já paga; só deixa de cobrar de novo. */
  async cancelRenewal (headers: Headers): Promise<ResponseDto<SubscriptionCancelRenewalResponse>> {
    const response = await this.http.connection.post<ResponseDto<SubscriptionCancelRenewalResponse>>('/cancel-renewal', undefined, withHeaders(headers))
    return response.data
  }

  /** Só com o provedor simulado: simula a próxima cobrança da renovação automática (aprovada). */
  async mockChargeNext (headers: Headers): Promise<ResponseDto<{ status: string }>> {
    const response = await this.http.connection.post<ResponseDto<{ status: string }>>('/mock/charge-next', undefined, withHeaders(headers))
    return response.data
  }

  /** Só com o provedor simulado (ambiente de teste): aprova ou recusa o pagamento. */
  async mockDecide (body: SubscriptionMockDecision, headers: Headers): Promise<ResponseDto<{ status: string }>> {
    const response = await this.http.connection.post<ResponseDto<{ status: string }>>('/mock/decide', body, withHeaders(headers))
    return response.data
  }
}
