import { Sapphire } from '@ascendance-hub/sapphire-core'
import { personSchema } from '../person/person-schema'

const s = new Sapphire()

export const USER_STATUSES = ['active', 'inactive', 'blocked'] as const
export const USER_ROLES = ['owner', 'member'] as const

export type UserStatus = typeof USER_STATUSES[number]
export type UserRole = typeof USER_ROLES[number]

/**
 * Usuário autenticável: É-UM Person (name, phone) + credencial e dados de acesso.
 * O e-mail é a credencial e vive aqui (não no person), com índice único na API.
 */
export const userSchema = personSchema.extend({
  email: s.string().email({ message: 'Informe um e-mail válido.' }),
  passwordHash: s.string(),
  status: s.type().enum(USER_STATUSES),
  role: s.type().enum(USER_ROLES),
  restaurantId: s.string(),
  termsAcceptedAt: s.string().optional(),
  lastAccessAt: s.string().optional(),
})
