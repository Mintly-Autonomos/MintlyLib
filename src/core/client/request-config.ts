import type { AxiosRequestConfig } from 'axios'
import type { Headers } from '../data/request/headers'

/**
 * Base compartilhada dos clients: propaga os headers de contexto (env,
 * authorization, restaurantId, ...) para o config do axios, preservando
 * qualquer config extra (ex.: `params` de paginação/filtro).
 */
export function withHeaders (headers: Headers, config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return { ...config, headers: { ...config.headers, ...headers } }
}
