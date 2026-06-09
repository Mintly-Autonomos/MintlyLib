import { Sapphire } from '@ascendance-hub/sapphire-core'
import { personRefSchema } from '../person/person-ref-schema'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Blocked = 'blocked',
}

export enum UserRole {
  Owner = 'owner',
  Member = 'member',
}

/**
 * Usuário autenticável. O `person` é um Extended Reference ({ _id, name })
 * para o documento em `people`; o e-mail é a credencial e vive aqui (índice
 * único na API).
 */
export const userSchema = s.object({
  person: personRefSchema,
  email: s.string().email({ message: 'Informe um e-mail válido.' }),
  passwordHash: s.string(),
  status: s.type().enum(UserStatus),
  role: s.type().enum(UserRole),
  restaurantId: s.string(),
  termsAcceptedAt: s.string().optional(),
  lastAccessAt: s.string().optional(),
  audit: auditSchema,
})
