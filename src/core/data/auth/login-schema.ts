import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/**
 * Payload do login. Não aplica a política de senha (isso é só no cadastro
 * e na redefinição) — aqui valida apenas o formato do e-mail.
 */
export const loginRequestSchema = s.object({
  email: s.string().email({ message: 'Informe um e-mail válido.' }),
  password: s.string(),
})

export type LoginRequest = Infer<typeof loginRequestSchema>
