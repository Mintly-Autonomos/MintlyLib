import { Sapphire } from '@ascendance-hub/sapphire-core'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

export const restaurantSchema = s.object({
  name: s.string(),
  audit: auditSchema,
})
