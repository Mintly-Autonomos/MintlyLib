import { Aurora, ORM } from '../../../aurora'

const aurora = new Aurora(ORM.MONGO)

export const personOrm = aurora.object({
  name: aurora.string(),
  age: aurora.number(),
})
