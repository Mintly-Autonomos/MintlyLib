import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { FinancialAccount } from '../core/data/financial/financial-account-entity'
import type { FinancialAccountActionResult, InactivateFinancialAccountRequest } from '../core/data/financial/financial-account-response'

export class FinancialAccountClient extends HttpBaseClient<FinancialAccount> {
  constructor () {
    super('financial-accounts')
  }

  /** Define a conta como padrão do restaurante (SetDefaultAccountUseCase). Não recebe corpo. */
  async defaultUpdate (id: string, headers: Headers): Promise<ResponseDto<FinancialAccountActionResult>> {
    const response = await this.connection.patch<ResponseDto<FinancialAccountActionResult>>(`/${id}/default`, undefined, withHeaders(headers))
    return response.data
  }

  /** Inativa a conta (InactivateAccountUseCase). replacementDefaultId é obrigatório se a conta for a padrão. */
  async inactivateUpdate (id: string, body: InactivateFinancialAccountRequest, headers: Headers): Promise<ResponseDto<FinancialAccountActionResult>> {
    const response = await this.connection.patch<ResponseDto<FinancialAccountActionResult>>(`/${id}/inactivate`, body, withHeaders(headers))
    return response.data
  }
}
