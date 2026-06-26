import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/**
 * Sub-documento de auditoria embutido em cada entity (lido junto do doc).
 * createdBy/updatedBy são opcionais: no cadastro inicial o primeiro usuário
 * é criado antes de existir um "autor" para referenciar.
 */
export const auditSchema = s.object({
  createdAt: s.date().coerce(),
  updatedAt: s.date().coerce(),
  createdBy: s.string().optional(),
  updatedBy: s.string().optional(),
})

export type Audit = Infer<typeof auditSchema>
