import type { User } from '../user/user-entity'
import type { Restaurant } from '../restaurant/restaurant-entity'

export interface AuthTokens {
  accessToken: string
  refreshToken: string | null
}

/** Visão pública do usuário — nunca expõe passwordHash. */
export type AuthUser = Omit<User, 'passwordHash'>

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
