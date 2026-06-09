import { HttpBaseClient } from '../core/client/http-base-client'
import type { FinancialAccount } from '../core/data/financial/financial-account-entity'

export class FinancialAccountClient extends HttpBaseClient<FinancialAccount> {
  constructor () {
    super('financial-accounts')
  }
}
