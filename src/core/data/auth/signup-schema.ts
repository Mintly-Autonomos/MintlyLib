import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'
import { personSchema } from '../person/person-schema'
import { passwordSchema } from './password-policy'

const s = new Sapphire()

/**
 * Payload do cadastro inicial. O `person` reaproveita o personSchema sem o
 * audit (`omit`), já que esses campos só são definidos no servidor. A
 * confirmação de senha e o aceite obrigatório são validações cross-field
 * tratadas no use case da API.
 */
export const signupRequestSchema = s.object({
  person: personSchema.omit(['audit']),
  email: s.string().email({ message: 'Informe um e-mail válido.' }),
  password: passwordSchema,
  restaurantName: s.string().min(2, { message: 'O nome do restaurante deve ter pelo menos 2 caracteres.' }),
  termsAccepted: s.boolean(),
})

export type SignupRequest = Infer<typeof signupRequestSchema>
