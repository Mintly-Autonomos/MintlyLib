import { Sapphire } from '@ascendance-hub/sapphire-core'
import { RecordStatus } from '../common/status'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

/**
 * Prato do cardápio. O preço é revisado a cada ~6 meses: o sistema avisa aos 5,5 meses
 * (`PRICE_REVIEW_ALERT_DAYS`) sem revisão. "Revisão" é editar o valor OU dizer que não quer
 * mudar — as duas coisas atualizam `priceReviewedAt` e silenciam o aviso.
 */

/** Dias sem revisão de preço a partir dos quais o prato entra nos avisos (~5,5 meses). */
export const PRICE_REVIEW_ALERT_DAYS = 167

/** Intervalo recomendado entre revisões de preço, em meses (informativo, para textos da tela). */
export const PRICE_REVIEW_INTERVAL_MONTHS = 6

export const menuItemSchema = s.object({
  restaurantId: s.string(),
  name: s.string().max(80),
  /** Grupo livre do cardápio (Frango, Bebidas…). */
  category: s.string().max(40).optional(),
  price: s.number().min(0),
  status: s.type().enum(RecordStatus),
  /** Última vez que o VALOR mudou (ou o cadastro, se nunca mudou). */
  priceUpdatedAt: s.date().coerce(),
  /** Última revisão do preço: mudou o valor ou escolheu manter. Base do aviso. */
  priceReviewedAt: s.date().coerce(),
  audit: auditSchema,
})

/** Corpo de POST /menu-items. O servidor preenche datas, status e restaurante. */
export const menuItemInsertSchema = s.object({
  name: s.string().max(80),
  price: s.number().min(0),
  category: s.string().max(40).optional(),
})

/** Corpo de PATCH /menu-items/:id — só dados de cadastro; preço tem rota própria. */
export const menuItemUpdateSchema = s.object({
  name: s.string().max(80),
  category: s.string().max(40),
}).partial()

/** Corpo de PATCH /menu-items/:id/price. */
export const menuItemPriceSchema = s.object({
  price: s.number().min(0),
})
