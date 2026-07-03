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
}

export enum OperationalNature {
  Operational = 'operational',
  NonOperational = 'nonOperational',
}

export const financialCategorySchema = s.object({
  restaurantId: s.string(),
  name: s.string(),
  type: s.type().enum(CategoryType),
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
  audit: auditSchema,
})

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
}).partial()
