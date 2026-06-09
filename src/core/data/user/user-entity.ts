import type { Infer } from '@ascendance-hub/sapphire-core'
import { Entity } from '../api/entity'
import { userSchema } from './user-schema'

export type User = Infer<typeof userSchema> & Entity
