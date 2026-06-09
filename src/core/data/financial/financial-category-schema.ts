import { Sapphire } from '@ascendance-hub/sapphire-core'
import { RECORD_STATUSES } from '../common/status'

const s = new Sapphire()

export const CATEGORY_TYPES = ['revenue', 'expense'] as const
export const CATEGORY_BEHAVIORS = ['fixed', 'variable'] as const
export const OPERATIONAL_NATURES = ['operational', 'nonOperational'] as const

export type CategoryType = typeof CATEGORY_TYPES[number]
export type CategoryBehavior = typeof CATEGORY_BEHAVIORS[number]
export type OperationalNature = typeof OPERATIONAL_NATURES[number]

export const financialCategorySchema = s.object({
  restaurantId: s.string(),
  name: s.string(),
  type: s.type().enum(CATEGORY_TYPES),
  behavior: s.type().enum(CATEGORY_BEHAVIORS),
  operationalNature: s.type().enum(OPERATIONAL_NATURES),
  status: s.type().enum(RECORD_STATUSES),
  isSystem: s.boolean(),
})
