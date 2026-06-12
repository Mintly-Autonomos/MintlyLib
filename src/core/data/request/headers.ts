/**
 * Headers de contexto enviados em toda requisição à API.
 *
 * - `env` é **obrigatório**: seleciona o banco do tenant (multi-tenant por env).
 * - `authorization` (Bearer token) e `restaurantId` aparecem nas rotas
 *   protegidas — opcionais porque rotas públicas (ex.: login) não os têm.
 * - O index signature mantém o type aberto para headers adicionais.
 */
export type Headers = {
  env: string
  authorization?: string
  restaurantId?: string
  [key: string]: string | undefined
}
