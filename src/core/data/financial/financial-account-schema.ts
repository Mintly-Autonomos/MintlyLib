import { Sapphire } from '@ascendance-hub/sapphire-core'
import { RECORD_STATUSES } from '../common/status'

const s = new Sapphire()

export const FINANCIAL_ACCOUNT_TYPES = ['bank', 'cash', 'digitalWallet', 'platform'] as const

export type FinancialAccountType = typeof FINANCIAL_ACCOUNT_TYPES[number]

export const financialAccountSchema = s.object({
  restaurantId: s.string(),
  name: s.string(),
  type: s.type().enum(FINANCIAL_ACCOUNT_TYPES),
  status: s.type().enum(RECORD_STATUSES),
  isDefault: s.boolean(),
  feePercent: s.number().optional(),
  settlementDays: s.number().optional(),
})
