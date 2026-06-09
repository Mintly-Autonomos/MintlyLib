import { Sapphire } from '@ascendance-hub/sapphire-core'
import { RecordStatus } from '../common/status'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

export enum FinancialAccountType {
  Bank = 'bank',
  Cash = 'cash',
  DigitalWallet = 'digitalWallet',
  Platform = 'platform',
}

export const financialAccountSchema = s.object({
  restaurantId: s.string(),
  name: s.string(),
  type: s.type().enum(FinancialAccountType),
  status: s.type().enum(RecordStatus),
  isDefault: s.boolean(),
  feePercent: s.number().optional(),
  settlementDays: s.number().optional(),
  audit: auditSchema,
})
