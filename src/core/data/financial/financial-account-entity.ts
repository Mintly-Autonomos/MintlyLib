import type { Infer } from '@ascendance-hub/sapphire-core'
import { Entity } from '../api/entity'
import { financialAccountSchema } from './financial-account-schema'

export type FinancialAccount = Infer<typeof financialAccountSchema> & Entity
