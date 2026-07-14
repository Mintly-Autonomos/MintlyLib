/**
 * Headers de contexto enviados em toda requisição à API.
 *
 * - `env` é **obrigatório**: seleciona o banco do ambiente (multi-ambiente por banco).
 * - `authorization` (Bearer token) aparece nas rotas protegidas — opcional porque
 *   rotas públicas (ex.: login) não o têm.
 *
 * Tipo FECHADO de propósito (P7): não existe index signature. O `restaurantId` era
 * campo morto — a API o deriva do JWT e sempre ignorou o header. Deixar a porta
 * aberta ("o tipo não modela, mas dá pra passar") só confundia. Quem é dono do dado
 * vem do token, ponto.
 */
export type Headers = {
  env: string
  authorization?: string
}
