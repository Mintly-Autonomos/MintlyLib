/**
 * Erro normalizado da API: expõe `code` (glossário: APP-000x/AUTH-000x/
 * VALIDATION_ERROR) e `status` HTTP, em vez do `AxiosError` cru (que vaza
 * config/request/stack do axios). Ver create-connection (M25).
 */
export class ApiError extends Error {
  constructor (
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
