import type { Infer } from '@ascendance-hub/sapphire-core'
import { Entity } from '../api/entity'
import { financialMovementSchema } from './financial-movement-schema'

export type FinancialMovement = Infer<typeof financialMovementSchema> & Entity
