import type { User } from '../user/user-entity'
import type { Restaurant } from '../restaurant/restaurant-entity'
import type { PersonRef } from '../person/person-ref-schema'

export interface AuthTokens {
  accessToken: string
  refreshToken: string | null
}

/**
 * Visão pública do usuário — nunca expõe passwordHash. O `person` ganha a foto de perfil
 * (data URL), lida do documento em `people` (o ref em `users` não a carrega, p/ não inchar).
 */
export type AuthUser = Omit<User, 'passwordHash' | 'person'> & {
  person: PersonRef & { avatar?: string }
}

export interface SignupResult extends AuthTokens {
  user: AuthUser
  restaurant: Restaurant
}

export interface LoginResult extends AuthTokens {
  user: AuthUser
}

export type RefreshResult = AuthTokens

/** Resposta das rotas de recuperação de senha — apenas a mensagem ao usuário. */
export interface RecoveryMessageResult {
  message: string
}
