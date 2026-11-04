import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'
import { passwordSchema } from '../auth/password-policy'
import type { UserRole } from '../user/user-schema'

const s = new Sapphire()

/**
 * Conta do usuário e do restaurante (editar dados, trocar e-mail e senha, funcionários e pedido de exclusão).
 * Todas as rotas usam o usuário/restaurante do token (`/me`): nenhum id de usuário vem do cliente, exceto o do
 * funcionário gerenciado pelo dono.
 */

/** Corpo do `PATCH /users/me`: nome e telefone (e-mail e senha têm rota própria, com confirmação por senha). */
export const accountUpdateSchema = s.object({
  name: s.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  phone: s.string().min(8, { message: 'Informe um telefone válido.' }),
}).partial()

/** Corpo do `PATCH /users/me/email`: o novo e-mail só vale com a senha atual. */
export const changeEmailRequestSchema = s.object({
  email: s.string().email({ message: 'Informe um e-mail válido.' }),
  currentPassword: s.string().min(1, { message: 'Informe sua senha atual.' }),
})

/** Corpo do `POST /users/me/password`: troca de senha logado, com a antiga. A nova segue a política de senha. */
export const changePasswordRequestSchema = s.object({
  currentPassword: s.string().min(1, { message: 'Informe sua senha atual.' }),
  newPassword: passwordSchema,
})

/** Situação de um funcionário. Bloqueio é do sistema (tentativas de senha), não do dono. */
export enum MemberStatus {
  Active = 'active',
  Inactive = 'inactive',
}

/** Corpo do `POST /restaurants/me/members`: cria um login de funcionário (papel `member`) no restaurante. */
export const memberCreateRequestSchema = s.object({
  name: s.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: s.string().email({ message: 'Informe um e-mail válido.' }),
  password: passwordSchema,
})

/** Corpo do `PATCH /restaurants/me/members/:id`: ativar/inativar e/ou definir uma senha nova. */
export const memberUpdateRequestSchema = s.object({
  status: s.type().enum(MemberStatus),
  password: passwordSchema,
}).partial()

/** Corpo do `POST /restaurants/me/deletion-request`: pedir a exclusão do restaurante, confirmando com a senha. */
export const deletionRequestSchema = s.object({
  password: s.string().min(1, { message: 'Informe sua senha para confirmar.' }),
  reason: s.string().max(500, { message: 'O motivo deve ter no máximo 500 caracteres.' }).optional(),
})

export type AccountUpdateRequest = Infer<typeof accountUpdateSchema>
export type ChangeEmailRequest = Infer<typeof changeEmailRequestSchema>
export type ChangePasswordRequest = Infer<typeof changePasswordRequestSchema>
export type MemberCreateRequest = Infer<typeof memberCreateRequestSchema>
export type MemberUpdateRequest = Infer<typeof memberUpdateRequestSchema>
export type DeletionRequest = Infer<typeof deletionRequestSchema>

/** Dados da conta de quem está logado (`GET /users/me`). */
export interface MyAccount {
  name: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
}

/** Funcionário do restaurante (nunca expõe o hash da senha). */
export interface RestaurantMember {
  _id: string
  name: string
  email: string
  status: MemberStatus
  lastAccessAt?: Date | string
  createdAt?: Date | string
}

/** Resposta do pedido/cancelamento de exclusão: quando foi pedida (`null` = sem pedido). */
export interface DeletionStatus {
  deletionRequestedAt: Date | string | null
}

/** Resposta de operações da conta que só confirmam o resultado. */
export interface AccountMessage {
  message: string
}
