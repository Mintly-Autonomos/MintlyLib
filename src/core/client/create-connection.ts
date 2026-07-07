import axios, { AxiosInstance } from 'axios'
import { ApiError } from './api-error'

const DEFAULT_TIMEOUT_MS = 15_000

/**
 * Fábrica única das conexões axios dos clients (fonte compartilhada — antes o
 * bootstrap era duplicado no HttpBaseClient e no AuthClient). Aplica:
 *  - M23: valida BACK_END_URL (senão a baseURL viraria "undefined/...");
 *  - M22: timeout (evita request pendurada indefinidamente);
 *  - M25: interceptor de resposta que troca o AxiosError cru pelo erro da API
 *    ({ code, message }) quando disponível.
 *
 * @param path segmento após a base (ex.: 'auth', 'financial-accounts').
 */
export function createHttpConnection (path: string): AxiosInstance {
  const backendUrl = process.env.BACK_END_URL
  if (!backendUrl) {
    throw new Error('BACK_END_URL não configurada: defina a URL base da API antes de instanciar os clients.')
  }

  const connection = axios.create({
    baseURL: `${backendUrl}/${path}`,
    timeout: Number(process.env.HTTP_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS),
    headers: { 'Content-Type': 'application/json' },
  })

  connection.interceptors.response.use(
    (response) => response,
    (error) => {
      const data = error?.response?.data
      if (data && typeof data === 'object' && 'code' in data) {
        return Promise.reject(new ApiError(String(data.code), String(data.message ?? ''), error.response.status))
      }
      return Promise.reject(error)
    },
  )

  return connection
}
