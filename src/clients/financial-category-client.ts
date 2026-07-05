import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { FinancialCategory } from '../core/data/financial/financial-category-entity'
import type { FinancialCategoryActionResult } from '../core/data/financial/financial-category-response'
import { MovementDirection } from '../core/data/financial/financial-movement-schema'

export class FinancialCategoryClient extends HttpBaseClient<FinancialCategory> {
  constructor () {
    super('financial-categories')
  }

  /** Inativa a categoria (InactivateCategoryUseCase). Não recebe corpo. */
  async inactivateUpdate (id: string, headers: Headers): Promise<ResponseDto<FinancialCategoryActionResult>> {
    const response = await this.connection.patch<ResponseDto<FinancialCategoryActionResult>>(`/${id}/inactivate`, undefined, withHeaders(headers))
    return response.data
  }

  /** Reativa a categoria (InactivateCategoryUseCase.reactivate). Não recebe corpo. */
  async reactivateUpdate (id: string, headers: Headers): Promise<ResponseDto<FinancialCategoryActionResult>> {
    const response = await this.connection.patch<ResponseDto<FinancialCategoryActionResult>>(`/${id}/reactivate`, undefined, withHeaders(headers))
    return response.data
  }

  /** Sugestão de categorias por direção do movimento (SuggestCategoriesQuery). Read-only. */
  async suggestions (direction: MovementDirection, headers: Headers): Promise<ResponseDto<FinancialCategory[]>> {
    const response = await this.connection.get<ResponseDto<FinancialCategory[]>>('/suggestions', withHeaders(headers, { params: { direction } }))
    return response.data
  }
}
