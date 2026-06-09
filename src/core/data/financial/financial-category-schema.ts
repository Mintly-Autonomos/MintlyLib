import { Sapphire } from '@ascendance-hub/sapphire-core'
import { RecordStatus } from '../common/status'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

export enum CategoryType {
  Revenue = 'revenue',
  Expense = 'expense',
}

export enum CategoryBehavior {
  Fixed = 'fixed',
  Variable = 'variable',
}

export enum OperationalNature {
  Operational = 'operational',
  NonOperational = 'nonOperational',
}

export const financialCategorySchema = s.object({
  restaurantId: s.string(),
  name: s.string(),
  type: s.type().enum(CategoryType),
  behavior: s.type().enum(CategoryBehavior),
  operationalNature: s.type().enum(OperationalNature),
  status: s.type().enum(RecordStatus),
  isSystem: s.boolean(),
  audit: auditSchema,
})
