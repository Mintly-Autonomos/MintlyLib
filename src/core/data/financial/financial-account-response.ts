/** Resposta das rotas de ação (default/inactivate) — apenas a mensagem ao usuário. */
export interface FinancialAccountActionResult {
  message: string
}

/** Corpo de PATCH /financial-accounts/:id/inactivate. Obrigatório só quando a conta-alvo é a padrão. */
export interface InactivateFinancialAccountRequest {
  replacementDefaultId?: string
}
