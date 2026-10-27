import { Sapphire } from '@ascendance-hub/sapphire-core'
import { auditSchema } from '../common/audit'
import { avatarSchema } from './person-avatar'

const s = new Sapphire()

export const personSchema = s.object({
  name: s.string(),
  phone: s.string(),
  avatar: avatarSchema.optional(),
  audit: auditSchema,
})
