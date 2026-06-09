import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/**
 * Extended Reference de um Person: subset denormalizado ({ _id, name })
 * embutido onde o nome é lido junto do doc (ex.: user.person). O documento
 * completo (name, phone, audit) continua na collection `people`.
 */
export const personRefSchema = s.object({
  _id: s.string(),
  name: s.string(),
})

export type PersonRef = Infer<typeof personRefSchema>
