import { Sapphire } from '@ascendance-hub/sapphire-core'
import { personRefSchema } from '../person/person-ref-schema'
import { auditSchema } from '../common/audit'
import { MemberProfile } from './member-profile'

const s = new Sapphire()

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Blocked = 'blocked',
  /** Funcionário convidado que ainda não criou a senha (E.1): não entra. */
  Invited = 'invited',
  /** Funcionário excluído pelo dono (E.2): sem login; o documento fica para o nome no histórico. */
  Removed = 'removed',
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
  /** Só funcionário (E.3). Ausente = `MEMBER_PROFILE_DEFAULT`. */
  memberProfile: s.type().enum(MemberProfile).optional(),
  termsAcceptedAt: s.date().coerce().optional(),
  lastAccessAt: s.date().coerce().optional(),
  audit: auditSchema,
})
