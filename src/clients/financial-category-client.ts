import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Insertable, Findable, Listable, Updatable } from '../core/client/base-client'
import type { FindAllRequestDto } from '../core/data/request/pagination'
import type { Headers } from '../core/data/request/headers'
import type { FinancialCategory } from '../core/data/financial/financial-category-entity'
import type { FinancialCategoryActionResult } from '../core/data/financial/financial-category-response'
import { MovementDirection } from '../core/data/financial/financial-movement-schema'

/**
 * A rota /financial-categories NÃO expõe GET /:id nem DELETE. COMPÕE o
 * HttpBaseClient e re-expõe só Insertable/Findable/Listable/Updatable + as ações
 * próprias (inactivate/reactivate/suggestions).
 */
export class FinancialCategoryClient
implements Insertable<FinancialCategory>, Findable<FinancialCategory>, Listable<FinancialCategory>, Updatable<FinancialCategory> {
  private readonly http = new HttpBaseClient<FinancialCategory>('financial-categories')

  insert (body: FinancialCategory, headers: Headers): Promise<ResponseDto<FinancialCategory>> {
    return this.http.insert(body, headers)
  }

  find (filter: Partial<FinancialCategory>, headers: Headers): Promise<ResponseDto<FinancialCategory>> {
    return this.http.find(filter, headers)
  }

  findAll (filter: FindAllRequestDto<FinancialCategory>, headers: Headers): Promise<ResponseDto<FinancialCategory[]>> {
    return this.http.findAll(filter, headers)
  }

  update (id: string, body: Partial<FinancialCategory>, headers: Headers): Promise<ResponseDto<FinancialCategory>> {
    return this.http.update(id, body, headers)
  }

  /** Inativa a categoria (InactivateCategoryUseCase). Não recebe corpo. */
  async inactivateUpdate (id: string, headers: Headers): Promise<ResponseDto<FinancialCategoryActionResult>> {
    const response = await this.http.connection.patch<ResponseDto<FinancialCategoryActionResult>>(`/${id}/inactivate`, undefined, withHeaders(headers))
    return response.data
  }

  /** Reativa a categoria (InactivateCategoryUseCase.reactivate). Não recebe corpo. */
  async reactivateUpdate (id: string, headers: Headers): Promise<ResponseDto<FinancialCategoryActionResult>> {
    const response = await this.http.connection.patch<ResponseDto<FinancialCategoryActionResult>>(`/${id}/reactivate`, undefined, withHeaders(headers))
    return response.data
  }

  /** Sugestão de categorias por direção do movimento (SuggestCategoriesQuery). Read-only. */
  async suggestions (direction: MovementDirection, headers: Headers): Promise<ResponseDto<FinancialCategory[]>> {
    const response = await this.http.connection.get<ResponseDto<FinancialCategory[]>>('/suggestions', withHeaders(headers, { params: { direction } }))
    return response.data
  }
}
