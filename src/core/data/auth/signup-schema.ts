import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'
import { personSchema } from '../person/person-schema'
import { passwordSchema } from './password-policy'

const s = new Sapphire()

/**
 * Payload do cadastro inicial. O `person` reaproveita o personSchema
 * ({ name, phone }) e a `password` reaproveita a passwordSchema.
 * A confirmação de senha e o aceite obrigatório são validações
 * cross-field tratadas no use case da API.
 */
export const signupRequestSchema = s.object({
  person: personSchema,
  email: s.string().email({ message: 'Informe um e-mail válido.' }),
  password: passwordSchema,
  restaurantName: s.string().min(2, { message: 'O nome do restaurante deve ter pelo menos 2 caracteres.' }),
  termsAccepted: s.boolean(),
})

export type SignupRequest = Infer<typeof signupRequestSchema>
