import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { MovementStatus } from '../core/data/financial/financial-movement-schema'
import type { FinancialMovement } from '../core/data/financial/financial-movement-entity'
import type { ImportMovementsRequest, ImportMovementsResult } from '../core/data/financial/financial-movement-import'
import type {
  RegisterMovementRequest,
  UpdateMovementRequest,
  MovementListQuery,
  FinancialMovementActionResult,
  ChangeMovementStatusRequest,
} from '../core/data/financial/financial-movement-response'

/**
 * Client de movimentações (MIN-49/50). Diferente dos outros CRUDs, o registro e
 * a edição têm corpos DEDICADOS (accountId/categoryId, não os snapshots) e há
 * ações próprias (status, recompute). Não há CRUD genérico útil aqui — por isso
 * COMPÕE o HttpBaseClient só pela conexão e expõe apenas os métodos próprios
 * (antes estendia e herdava insert/update/findById/delete com body/rota errados).
 */
export class FinancialMovementClient {
  private readonly http = new HttpBaseClient<FinancialMovement>('financial-movements')

  /** Registra entrada/saída + ajusta saldo (transacional). Resolve 409 de duplicidade com confirmDuplicate. */
  async register (body: RegisterMovementRequest, headers: Headers): Promise<ResponseDto<FinancialMovement>> {
    const response = await this.http.connection.post<ResponseDto<FinancialMovement>>('/', body, withHeaders(headers))
    return response.data
  }

  /**
   * Importa várias movimentações de uma vez (até IMPORT_MOVEMENTS_MAX_ROWS). Cada linha é gravada como
   * um `register` independente e o resultado vem linha a linha; reenviar a mesma `idempotencyKey`
   * devolve o resultado guardado, sem duplicar.
   */
  async importMovements (body: ImportMovementsRequest, headers: Headers): Promise<ResponseDto<ImportMovementsResult>> {
    const response = await this.http.connection.post<ResponseDto<ImportMovementsResult>>('/import', body, withHeaders(headers))
    return response.data
  }

  /** Lista movimentações (busca textual + filtros direction/status/período + paginação). */
  async list (query: MovementListQuery, headers: Headers): Promise<ResponseDto<FinancialMovement[]>> {
    const response = await this.http.connection.get<ResponseDto<FinancialMovement[]>>('/', withHeaders(headers, { params: query }))
    return response.data
  }

  /** Edita a movimentação (reverte efeito antigo + aplica novo no saldo). `direction` é imutável. */
  async updateMovement (id: string, body: UpdateMovementRequest, headers: Headers): Promise<ResponseDto<FinancialMovement>> {
    const response = await this.http.connection.patch<ResponseDto<FinancialMovement>>(`/${id}`, body, withHeaders(headers))
    return response.data
  }

  /** Muda o status (pending/settled/cancelled) corrigindo o saldo. `settledAt` informa quando o dinheiro mexeu; ausente = agora. */
  async changeStatus (
    id: string,
    status: MovementStatus,
    headers: Headers,
    options: { settledAt?: string | Date } = {},
  ): Promise<ResponseDto<FinancialMovement>> {
    const body: ChangeMovementStatusRequest = { status, ...options }
    const response = await this.http.connection.patch<ResponseDto<FinancialMovement>>(`/${id}/status`, body, withHeaders(headers))
    return response.data
  }

  /** Reconcilia o saldo de uma conta a partir das movimentações. */
  async recomputeBalances (accountId: string, headers: Headers): Promise<ResponseDto<FinancialMovementActionResult>> {
    const response = await this.http.connection.post<ResponseDto<FinancialMovementActionResult>>('/recompute-balances', { accountId }, withHeaders(headers))
    return response.data
  }
}
