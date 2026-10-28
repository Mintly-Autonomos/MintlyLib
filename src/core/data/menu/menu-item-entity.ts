import type { Infer } from '@ascendance-hub/sapphire-core'
import { Entity } from '../api/entity'
import { menuItemSchema } from './menu-item-schema'

export type MenuItem = Infer<typeof menuItemSchema> & Entity
