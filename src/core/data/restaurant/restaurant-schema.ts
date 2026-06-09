import { Sapphire } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

export const restaurantSchema = s.object({
  name: s.string(),
})
