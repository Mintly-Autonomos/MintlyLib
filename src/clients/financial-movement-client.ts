import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Headers } from '../core/data/request/headers'
import type { MovementStatus } from '../core/data/financial/financial-movement-schema'
import type { FinancialMovement } from '../core/data/financial/financial-movement-entity'
import type {
  RegisterMovementRequest,
  UpdateMovementRequest,
  MovementListQuery,
  FinancialMovementActionResult,
} from '../core/data/financial/financial-movement-response'

/**
 * Client de movimentações (MIN-49/50). Diferente dos outros CRUDs, o registro e
 * a edição têm corpos dedicados (accountId/categoryId, não os snapshots), e há
 * ações próprias (status, recompute). Por isso os métodos abaixo não reaproveitam
 * `insert`/`update`/`findAll` do base — usam `register`/`updateMovement`/`list`.
 */
export class FinancialMovementClient extends HttpBaseClient<FinancialMovement> {
  constructor () {
    super('financial-movements')
  }

  /** Registra entrada/saída + ajusta saldo (transacional). Resolve 409 de duplicidade com confirmDuplicate. */
  async register (body: RegisterMovementRequest, headers: Headers): Promise<ResponseDto<FinancialMovement>> {
    const response = await this.connection.post<ResponseDto<FinancialMovement>>('/', body, withHeaders(headers))
    return response.data
  }

  /** Lista movimentações (busca textual + filtros direction/status/período + paginação). */
  async list (query: MovementListQuery, headers: Headers): Promise<ResponseDto<FinancialMovement[]>> {
    const response = await this.connection.get<ResponseDto<FinancialMovement[]>>('/', withHeaders(headers, { params: query }))
    return response.data
  }

  /** Edita a movimentação (reverte efeito antigo + aplica novo no saldo). `direction` é imutável. */
  async updateMovement (id: string, body: UpdateMovementRequest, headers: Headers): Promise<ResponseDto<FinancialMovement>> {
    const response = await this.connection.patch<ResponseDto<FinancialMovement>>(`/${id}`, body, withHeaders(headers))
    return response.data
  }

  /** Muda o status (pending/settled/cancelled) corrigindo o saldo. */
  async changeStatus (id: string, status: MovementStatus, headers: Headers): Promise<ResponseDto<FinancialMovement>> {
    const response = await this.connection.patch<ResponseDto<FinancialMovement>>(`/${id}/status`, { status }, withHeaders(headers))
    return response.data
  }

  /** Reconcilia o saldo de uma conta a partir das movimentações. */
  async recomputeBalances (accountId: string, headers: Headers): Promise<ResponseDto<FinancialMovementActionResult>> {
    const response = await this.connection.post<ResponseDto<FinancialMovementActionResult>>('/recompute-balances', { accountId }, withHeaders(headers))
    return response.data
  }
}
