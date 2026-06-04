import { Sapphire } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

export const personSchema = s.object({
  name: s.string(),
  age: s.number(),
})
