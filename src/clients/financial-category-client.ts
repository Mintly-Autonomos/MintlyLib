import { HttpBaseClient } from '../core/client/http-base-client'
import type { FinancialCategory } from '../core/data/financial/financial-category-entity'

export class FinancialCategoryClient extends HttpBaseClient<FinancialCategory> {
  constructor () {
    super('financial-categories')
  }
}
