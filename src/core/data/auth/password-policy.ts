import { Sapphire } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/**
 * Política de senha compartilhada: mínimo 8 caracteres, ao menos
 * 1 maiúscula, 1 minúscula e 1 número. Reutilizada no cadastro e na
 * redefinição de senha (MIN-59) para manter a regra num único lugar.
 */
export const passwordSchema = s.string()
  .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  .regex(
    /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
    { message: 'A senha deve conter ao menos uma letra maiúscula, uma minúscula e um número.' },
  )
