import { Sapphire } from '@ascendance-hub/sapphire-core'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

/**
 * Regime tributário (M5 / MIN-23). Decide o caminho do cálculo: MEI paga DAS
 * fixo; Simples Nacional Anexo I paga alíquota efetiva sobre a receita.
 * Ausente = "não configurado" (o imposto sai 0 com aviso).
 */
export enum TaxRegime {
  Mei = 'mei',
  SimplesNacionalAnexoI = 'simplesNacionalAnexoI',
}

export const restaurantSchema = s.object({
  name: s.string(),
  taxRegime: s.type().enum(TaxRegime).optional(),
  /**
   * Primeiro acesso: quando o dono concluiu o onboarding. O cadastro grava `null` (vazio = onboarding
   * pendente); o servidor preenche a data ao concluir (`POST /restaurants/me/first-access`). Restaurantes
   * anteriores a este campo NÃO o têm (ausente): nada pendente, não passam pelo onboarding.
   */
  firstAccessAt: s.date().coerce().optional(),
  audit: auditSchema,
})

// Corpo do PATCH /restaurants/me. Objeto estrito: audit e qualquer outro campo
// são rejeitados (mass assignment).
export const restaurantUpdateSchema = s.object({
  name: s.string(),
  taxRegime: s.type().enum(TaxRegime),
}).partial()
