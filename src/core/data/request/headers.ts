/**
 * Headers de contexto enviados em toda requisição à API.
 *
 * - `env` é **obrigatório**: seleciona o banco do tenant (multi-tenant por env).
 * - `authorization` (Bearer token) aparece nas rotas protegidas — opcional
 *   porque rotas públicas (ex.: login) não o têm.
 * - `restaurantId` NÃO é modelado: a API o deriva do JWT e ignora o header (era
 *   campo morto). O index signature ainda aceita headers adicionais se preciso.
 */
export type Headers = {
  env: string
  authorization?: string
  [key: string]: string | undefined
}
