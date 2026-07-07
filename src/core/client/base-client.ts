import { FindAllRequestDto } from '../data/request/pagination'
import { ResponseDto } from '../data/request/response'
import { Headers } from '../data/request/headers'

/**
 * Interfaces de capacidade (segregação): cada client declara SÓ as operações que
 * a rota da API realmente expõe. Antes um único BaseClient com todo o CRUD era
 * herdado por todos, expondo findById/delete inexistentes (404 em runtime).
 */
export interface Insertable<T> { insert(body: T, headers: Headers): Promise<ResponseDto<T>> }
export interface Gettable<T> { findById(id: string, headers: Headers): Promise<ResponseDto<T>> }
export interface Findable<T> { find(filter: Partial<T>, headers: Headers): Promise<ResponseDto<T>> }
export interface Listable<T> { findAll(filter: FindAllRequestDto<T>, headers: Headers): Promise<ResponseDto<T[]>> }
export interface Updatable<T> { update(id: string, body: Partial<T>, headers: Headers): Promise<ResponseDto<T>> }
export interface Deletable { delete(id: string, headers: Headers): Promise<void> }

/** CRUD completo — só para recursos cuja rota expõe tudo (ex.: /people). */
export interface BaseClient<T>
  extends Insertable<T>, Gettable<T>, Findable<T>, Listable<T>, Updatable<T>, Deletable {}
