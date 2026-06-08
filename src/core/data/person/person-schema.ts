import { Sapphire } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

export const personSchema = s.object({
  name: s.string(),
  email: s.string().email({ message: 'Informe um e-mail válido.' }),
  cpf: s.string().optional(),
})
