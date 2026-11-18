import type { Infer } from '@ascendance-hub/sapphire-core'
import { Entity } from '../api/entity'
import { restaurantSchema, teamMemberSchema } from './restaurant-schema'

export type Restaurant = Infer<typeof restaurantSchema> & Entity
/** Pessoa da equipe com a carga semanal (P.4). */
export type TeamMember = Infer<typeof teamMemberSchema>
