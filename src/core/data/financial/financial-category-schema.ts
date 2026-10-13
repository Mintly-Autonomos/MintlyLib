import { Sapphire } from '@ascendance-hub/sapphire-core'
import { RecordStatus } from '../common/status'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

export enum CategoryType {
  Revenue = 'revenue',
  Expense = 'expense',
}

export enum CategoryBehavior {
  Fixed = 'fixed',
  Variable = 'variable',
  /** Parte fixa, parte variável (ex.: utilidades). No ponto de equilíbrio: N8, fatia 4. */
  Mixed = 'mixed',
}

/**
 * Classificação contábil da DESPESA no DRE (M2). Só existe em categoria de
 * despesa — por isso a união discriminada por `type` abaixo.
 *  - cmv: ingredientes e insumos (margem bruta)
 *  - labor: pró-labore e salários (prime cost)
 *  - tax: imposto — sai da despesa operacional; o DRE deduz pela alíquota (M5)
 *  - opex: demais despesas operacionais
 */
export enum DreGroup {
  Cmv = 'cmv',
  Labor = 'labor',
  Tax = 'tax',
  Opex = 'opex',
}

export enum OperationalNature {
  Operational = 'operational',
  NonOperational = 'nonOperational',
}

/**
 * Subcategoria (M4, fatia 5): detalhe da categoria — CMV/Insumos → Frango, Óleo…
 * Embutida no documento da categoria (poucas, lidas junto, sem $lookup) e
 * gerida só pelo sub-recurso /:id/subcategories. Só inativação, nunca apagada.
 */
export const subcategorySchema = s.object({
  _id: s.string(),
  name: s.string().max(60),
  status: s.type().enum(RecordStatus),
})

/** Corpo de POST /financial-categories/:id/subcategories. */
export const subcategoryInsertSchema = s.object({ name: s.string().max(60) })

/** Corpo de PATCH /financial-categories/:id/subcategories/:subId (status vai por inactivate/reactivate). */
export const subcategoryUpdateSchema = s.object({ name: s.string().max(60) }).partial()

const baseCategorySchema = s.object({
  restaurantId: s.string(),
  name: s.string(),
  behavior: s.type().enum(CategoryBehavior),
  operationalNature: s.type().enum(OperationalNature),
  status: s.type().enum(RecordStatus),
  isSystem: s.boolean(),
  // Denormalizado p/ SuggestCategoriesQuery (heurística recência+frequência).
  // Mantido pelo RegisterMovementUseCase (MIN-49/50), não editável via CRUD.
  usage: s.number().int().default(0),
  lastUsedAt: s.date().coerce().optional(),
  history: s.array(
    s.object({
      at: s.date().coerce(),
      by: s.string(),
      action: s.string(),
      detail: s.string().optional(),
    }),
  ).default([]),
  // Só muda pelo sub-recurso; os schemas de insert/update (estritos) não aceitam.
  subcategories: s.array(subcategorySchema).default([]),
  audit: auditSchema,
})

// União discriminada por `type` (mesmo recurso do financialAccountSchema): só
// despesa tem dreGroup, e nela ele é obrigatório. O Sapphire não tem `refine`,
// então é assim que a coerência tipo × grupo fica no contrato.
const revenueCategorySchema = baseCategorySchema.extend({
  type: s.type().literal(CategoryType.Revenue),
})

const expenseCategorySchema = baseCategorySchema.extend({
  type: s.type().literal(CategoryType.Expense),
  dreGroup: s.type().enum(DreGroup),
})

export const financialCategorySchema = s.type().union([revenueCategorySchema, expenseCategorySchema])

// Campos editáveis via PATCH — mesmo padrão do financialAccountUpdateSchema:
// objeto achatado + .partial(). restaurantId, isSystem, usage, lastUsedAt,
// history e audit ficam de fora de propósito (protegidos/computados pelo
// sistema; como o objeto é estrito, enviá-los num PATCH é rejeitado).
export const financialCategoryUpdateSchema = s.object({
  name: s.string(),
  type: s.type().enum(CategoryType),
  behavior: s.type().enum(CategoryBehavior),
  operationalNature: s.type().enum(OperationalNature),
  status: s.type().enum(RecordStatus),
  // a coerência com o tipo GRAVADO é validada na API (category-rules)
  dreGroup: s.type().enum(DreGroup),
}).partial()

// Schema de INSERT (POST /financial-categories). Diferente do schema completo
// (entity), os campos que o servidor computa/força ficam OPCIONAIS — assim o
// client não precisa enviá-los (audit é preenchido no servidor; restaurantId vem
// do RequestContext; isSystem/usage/history são forçados no repositório). Mantém
// compatibilidade com clients que ainda enviam esses campos, e resolve o
// VALIDATION_ERROR de quando o `audit` era obrigatório no insert.
export const financialCategoryInsertSchema = s.object({
  name: s.string(),
  type: s.type().enum(CategoryType),
  behavior: s.type().enum(CategoryBehavior),
  operationalNature: s.type().enum(OperationalNature),
  status: s.type().enum(RecordStatus),
  // opcional: a API completa com 'opex' em despesa e recusa em receita
  dreGroup: s.type().enum(DreGroup).optional(),
  restaurantId: s.string().optional(),
  isSystem: s.boolean().optional(),
  usage: s.number().int().optional(),
  lastUsedAt: s.date().coerce().optional(),
  history: s.array(
    s.object({
      at: s.date().coerce(),
      by: s.string(),
      action: s.string(),
      detail: s.string().optional(),
    }),
  ).optional(),
  audit: auditSchema.optional(),
})
