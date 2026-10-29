import { Sapphire } from '@ascendance-hub/sapphire-core'
import { registerMovementSchema } from './financial-movement-schema'
import type { FinancialMovement } from './financial-movement-entity'
import type { RegisterMovementRequest } from './financial-movement-response'

const s = new Sapphire()

/** Máximo de linhas por importação (um único pedido). Acima disso, enviar em mais de um pedido. */
export const IMPORT_MOVEMENTS_MAX_ROWS = 500

/** Linha da importação: o mesmo corpo de `POST /financial-movements` + o número da linha na planilha. */
export const importMovementRowSchema = registerMovementSchema.extend({
  row: s.number().int().min(1),
})

/**
 * Corpo de POST /financial-movements/import. `idempotencyKey` identifica a importação (ex.: hash
 * do conteúdo): reenviar a MESMA chave devolve o resultado da primeira vez, sem gravar de novo.
 */
export const importMovementsSchema = s.object({
  idempotencyKey: s.string().min(8).max(128),
  rows: s.array(importMovementRowSchema).min(1).max(IMPORT_MOVEMENTS_MAX_ROWS),
})

export interface ImportMovementRow extends RegisterMovementRequest {
  /** Número da linha na planilha (1 = primeira linha de dados), devolvido no resultado. */
  row: number
}

export interface ImportMovementsRequest {
  idempotencyKey: string
  rows: ImportMovementRow[]
}

export interface ImportMovementRowResult {
  row: number
  status: 'created' | 'failed'
  /** Presente quando `status` é `created`. */
  movement?: FinancialMovement
  /** Presente quando `status` é `failed`: motivo legível e código estável para a tela. */
  error?: { code: string; message: string }
}

export interface ImportMovementsResult {
  /** `true` quando a chave já tinha sido usada: este é o resultado guardado, nada foi gravado agora. */
  replayed: boolean
  total: number
  created: number
  failed: number
  /** Um item por linha enviada, na mesma ordem. */
  results: ImportMovementRowResult[]
}
