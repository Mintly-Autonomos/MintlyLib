import type { Infer } from '@ascendance-hub/sapphire-core'
import { Entity } from '../api/entity'
import { financialCategorySchema } from './financial-category-schema'

export type FinancialCategory = Infer<typeof financialCategorySchema> & Entity
