/**
 * Convite de funcionário (relatório Sweetie Bel, E.1). O dono informa nome e e-mail; o funcionário recebe um
 * link de uso único e cria a própria senha. A política de senha é conferida na API (como no reset de senha).
 */

/** Validade do link do convite, em dias. */
export const MEMBER_INVITE_EXPIRY_DAYS = 7

/** Corpo de POST /auth/invite/preview: o token do link. */
export interface InvitePreviewRequest {
  token: string
}

/** Resposta de POST /auth/invite/preview: para a tela de aceitar mostrar para quem é o convite. */
export interface InvitePreview {
  name: string
  email: string
  restaurantName: string
  expiresAt: Date | string
}

/** Corpo de POST /auth/invite/accept: cria a senha e ativa o login do funcionário. */
export interface AcceptInviteRequest {
  token: string
  newPassword: string
  confirmNewPassword: string
}
