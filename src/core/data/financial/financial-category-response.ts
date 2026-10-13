import type { Infer } from '@ascendance-hub/sapphire-core'
import type { subcategorySchema } from './financial-category-schema'

/** Resposta das rotas de ação (inactivate/reactivate) — apenas a mensagem ao usuário. */
export interface FinancialCategoryActionResult {
  message: string
}

/** Subcategoria embutida na categoria (fatia 5). */
export type Subcategory = Infer<typeof subcategorySchema>

/** Corpo de criação/renomeação de subcategoria. */
export interface SubcategoryRequest {
  name: string
}
