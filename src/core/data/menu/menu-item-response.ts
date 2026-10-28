import type { Infer } from '@ascendance-hub/sapphire-core'
import type { MenuItem } from './menu-item-entity'
import type { menuItemInsertSchema, menuItemUpdateSchema } from './menu-item-schema'

/** Resposta das rotas de ação (inactivate/reactivate) — apenas a mensagem ao usuário. */
export interface MenuItemActionResult {
  message: string
}

/** Corpo de POST /menu-items. */
export type MenuItemInsertRequest = Infer<typeof menuItemInsertSchema>

/** Corpo de PATCH /menu-items/:id (nome/categoria; o preço tem rota própria). */
export type MenuItemUpdateRequest = Infer<typeof menuItemUpdateSchema>

/** Corpo de PATCH /menu-items/:id/price. */
export interface MenuItemPriceRequest {
  price: number
}

/** Prato com preço sem revisão há tempo demais (GET /menu-items/price-alerts). */
export type MenuItemPriceAlert = MenuItem & {
  /** Dias desde a última revisão do preço. */
  daysSinceReview: number
}
