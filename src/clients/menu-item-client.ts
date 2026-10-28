import { ResponseDto, withHeaders } from '../core'
import { HttpBaseClient } from '../core/client/http-base-client'
import type { Findable, Listable } from '../core/client/base-client'
import type { FindAllRequestDto } from '../core/data/request/pagination'
import type { Headers } from '../core/data/request/headers'
import type { MenuItem } from '../core/data/menu/menu-item-entity'
import type {
  MenuItemActionResult,
  MenuItemInsertRequest,
  MenuItemPriceAlert,
  MenuItemUpdateRequest,
} from '../core/data/menu/menu-item-response'

/**
 * Cardápio (pratos com preço). A rota /menu-items NÃO expõe GET /:id nem DELETE (só inativação).
 * COMPÕE o HttpBaseClient e re-expõe o subconjunto válido + as ações próprias de preço.
 */
export class MenuItemClient implements Findable<MenuItem>, Listable<MenuItem> {
  private readonly http = new HttpBaseClient<MenuItem>('menu-items')

  /** Cadastra um prato. O servidor define status, datas e restaurante. */
  async insert (body: MenuItemInsertRequest, headers: Headers): Promise<ResponseDto<MenuItem>> {
    const response = await this.http.connection.post<ResponseDto<MenuItem>>('/', body, withHeaders(headers))
    return response.data
  }

  find (filter: Partial<MenuItem>, headers: Headers): Promise<ResponseDto<MenuItem>> {
    return this.http.find(filter, headers)
  }

  findAll (filter: FindAllRequestDto<MenuItem>, headers: Headers): Promise<ResponseDto<MenuItem[]>> {
    return this.http.findAll(filter, headers)
  }

  /** Edita nome/categoria. Para mudar o preço use `updatePrice`. */
  update (id: string, body: MenuItemUpdateRequest, headers: Headers): Promise<ResponseDto<MenuItem>> {
    return this.http.update(id, body as Partial<MenuItem>, headers)
  }

  /** Muda o preço: atualiza o valor e conta como revisão (silencia o aviso). */
  async updatePrice (id: string, price: number, headers: Headers): Promise<ResponseDto<MenuItem>> {
    const response = await this.http.connection.patch<ResponseDto<MenuItem>>(`/${id}/price`, { price }, withHeaders(headers))
    return response.data
  }

  /** "Não quero mudar": mantém o valor e conta como revisão (silencia o aviso). Não recebe corpo. */
  async keepPrice (id: string, headers: Headers): Promise<ResponseDto<MenuItem>> {
    const response = await this.http.connection.post<ResponseDto<MenuItem>>(`/${id}/price-review`, undefined, withHeaders(headers))
    return response.data
  }

  /** Pratos ativos com o preço sem revisão há PRICE_REVIEW_ALERT_DAYS dias ou mais. Read-only. */
  async priceAlerts (headers: Headers): Promise<ResponseDto<MenuItemPriceAlert[]>> {
    const response = await this.http.connection.get<ResponseDto<MenuItemPriceAlert[]>>('/price-alerts', withHeaders(headers))
    return response.data
  }

  /** Inativa o prato (some dos novos usos; nada é apagado). Não recebe corpo. */
  async inactivateUpdate (id: string, headers: Headers): Promise<ResponseDto<MenuItemActionResult>> {
    const response = await this.http.connection.patch<ResponseDto<MenuItemActionResult>>(`/${id}/inactivate`, undefined, withHeaders(headers))
    return response.data
  }

  /** Reativa o prato. Não recebe corpo. */
  async reactivateUpdate (id: string, headers: Headers): Promise<ResponseDto<MenuItemActionResult>> {
    const response = await this.http.connection.patch<ResponseDto<MenuItemActionResult>>(`/${id}/reactivate`, undefined, withHeaders(headers))
    return response.data
  }
}
