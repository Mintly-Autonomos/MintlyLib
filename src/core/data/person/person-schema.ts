import { Sapphire } from '@ascendance-hub/sapphire-core'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

export const personSchema = s.object({
  name: s.string(),
  phone: s.string(),
  audit: auditSchema,
})
