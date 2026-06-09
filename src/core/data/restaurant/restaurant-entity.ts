import type { Infer } from '@ascendance-hub/sapphire-core'
import { Entity } from '../api/entity'
import { restaurantSchema } from './restaurant-schema'

export type Restaurant = Infer<typeof restaurantSchema> & Entity
