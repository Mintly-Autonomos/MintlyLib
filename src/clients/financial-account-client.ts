import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Insertable, Findable, Listable, Updatable } from '../core/client/base-client'
import type { FindAllRequestDto } from '../core/data/request/pagination'
import type { Headers } from '../core/data/request/headers'
import type { FinancialAccount } from '../core/data/financial/financial-account-entity'
import type { FinancialAccountActionResult, InactivateFinancialAccountRequest } from '../core/data/financial/financial-account-response'

/**
 * A rota /financial-accounts NÃO expõe GET /:id nem DELETE — só POST, GET (lista/
 * find), PATCH e as ações próprias (default/inactivate). Por isso COMPÕE o
 * HttpBaseClient e re-expõe apenas Insertable/Findable/Listable/Updatable, em vez
 * de estender (que traria findById/delete inexistentes → 404).
 */
export class FinancialAccountClient
implements Insertable<FinancialAccount>, Findable<FinancialAccount>, Listable<FinancialAccount>, Updatable<FinancialAccount> {
  private readonly http = new HttpBaseClient<FinancialAccount>('financial-accounts')

  insert (body: FinancialAccount, headers: Headers): Promise<ResponseDto<FinancialAccount>> {
    return this.http.insert(body, headers)
  }

  find (filter: Partial<FinancialAccount>, headers: Headers): Promise<ResponseDto<FinancialAccount>> {
    return this.http.find(filter, headers)
  }

  findAll (filter: FindAllRequestDto<FinancialAccount>, headers: Headers): Promise<ResponseDto<FinancialAccount[]>> {
    return this.http.findAll(filter, headers)
  }

  update (id: string, body: Partial<FinancialAccount>, headers: Headers): Promise<ResponseDto<FinancialAccount>> {
    return this.http.update(id, body, headers)
  }

  /** Define a conta como padrão do restaurante (SetDefaultAccountUseCase). Não recebe corpo. */
  async defaultUpdate (id: string, headers: Headers): Promise<ResponseDto<FinancialAccountActionResult>> {
    const response = await this.http.connection.patch<ResponseDto<FinancialAccountActionResult>>(`/${id}/default`, undefined, withHeaders(headers))
    return response.data
  }

  /** Inativa a conta (InactivateAccountUseCase). replacementDefaultId é obrigatório se a conta for a padrão. */
  async inactivateUpdate (id: string, body: InactivateFinancialAccountRequest, headers: Headers): Promise<ResponseDto<FinancialAccountActionResult>> {
    const response = await this.http.connection.patch<ResponseDto<FinancialAccountActionResult>>(`/${id}/inactivate`, body, withHeaders(headers))
    return response.data
  }
}
