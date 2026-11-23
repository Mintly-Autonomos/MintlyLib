import { Sapphire } from '@ascendance-hub/sapphire-core'
import { auditSchema } from '../common/audit'
import { MENU_CATEGORY_PROFILES_MAX, menuCategoryProfileSchema } from '../menu/sales-profile'

const s = new Sapphire()

/**
 * Regime tributário (M5 / MIN-23). Decide o caminho do cálculo: MEI paga DAS
 * fixo; Simples Nacional paga alíquota efetiva sobre a receita, pela tabela do anexo:
 * Anexo I (comércio: revenda) ou Anexo II (indústria: produção própria, como confeitaria
 * e padaria que fabricam o que vendem). Pode ser trocado a qualquer momento.
 * Ausente = "não configurado" (o imposto sai 0 com aviso).
 */
export enum TaxRegime {
  Mei = 'mei',
  SimplesNacionalAnexoI = 'simplesNacionalAnexoI',
  SimplesNacionalAnexoII = 'simplesNacionalAnexoII',
}

/** Limites da equipe (P.4). */
export const TEAM_MAX_MEMBERS = 50
export const TEAM_MAX_WEEKLY_HOURS = 112

/**
 * Pessoa da equipe para a recomendação de contratação (P.4): nome e carga semanal do contrato. Não é login:
 * inclui o dono e quem não usa o app (os acessos ficam em `users`, com convite).
 */
export const teamMemberSchema = s.object({
  name: s.string().min(1, { message: 'Informe o nome.' }).max(80, { message: 'O nome deve ter no máximo 80 caracteres.' }),
  weeklyHours: s.number()
    .min(1, { message: 'Informe as horas por semana.' })
    .max(TEAM_MAX_WEEKLY_HOURS, { message: `No máximo ${TEAM_MAX_WEEKLY_HOURS} horas por semana.` }),
})

/** Até quantos meses de faturamento anterior ao Mintly o dono informa (o RBT12 olha 12 meses). */
export const REVENUE_BEFORE_MINTLY_MAX = 12

/** Mês `AAAA-MM`. */
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

/**
 * Faturamento de um mês ANTES de o restaurante usar o Mintly (Simples Nacional: entra no RBT12 dos primeiros
 * meses). Mês que já tem venda lançada no Mintly ignora este valor: vale o que foi lançado.
 */
export const revenueBeforeMintlySchema = s.object({
  month: s.string().regex(MONTH_PATTERN, { message: 'Mês no formato AAAA-MM.' }),
  amount: s.number().min(0, { message: 'O faturamento não pode ser negativo.' }),
})

const revenueBeforeSchema = s.array(revenueBeforeMintlySchema)
  .max(REVENUE_BEFORE_MINTLY_MAX, { message: `No máximo ${REVENUE_BEFORE_MINTLY_MAX} meses.` })

/** Mês de abertura da empresa (`AAAA-MM`); string vazia = não informado. */
const activityStartSchema = s.string().regex(/^(\d{4}-(0[1-9]|1[0-2]))?$/, { message: 'Mês no formato AAAA-MM.' })

const teamSchema = s.array(teamMemberSchema).max(TEAM_MAX_MEMBERS, { message: `No máximo ${TEAM_MAX_MEMBERS} pessoas na equipe.` })

export const restaurantSchema = s.object({
  name: s.string(),
  taxRegime: s.type().enum(TaxRegime).optional(),
  /**
   * Primeiro acesso: quando o dono concluiu o onboarding. O cadastro grava `null` (vazio = onboarding
   * pendente); o servidor preenche a data ao concluir (`POST /restaurants/me/first-access`). Restaurantes
   * anteriores a este campo NÃO o têm (ausente): nada pendente, não passam pelo onboarding.
   */
  firstAccessAt: s.date().coerce().optional(),
  /**
   * Quando o dono pediu a exclusão do restaurante (`POST /restaurants/me/deletion-request`). Ausente/`null` =
   * sem pedido. É só um pedido: nada é apagado até ser analisado, e o dono pode cancelar.
   */
  deletionRequestedAt: s.date().coerce().optional(),
  /** Equipe e carga semanal (P.4). Ausente = não informada (a recomendação de contratação fica oculta). */
  team: teamSchema.optional(),
  /**
   * Início da atividade (CGSN 140/2018, art. 22). No Simples, o RBT12 dos 12 primeiros meses é proporcional:
   * no mês de início, a receita do mês × 12 (§2º); depois, a média dos meses anteriores × 12 (§3º). Ausente ou
   * vazio = o primeiro mês com venda no Mintly. Empresa aberta antes do Mintly informa o mês e o faturamento
   * anterior (`revenueBeforeMintly`).
   */
  activityStart: activityStartSchema.optional(),
  /** Faturamento mensal antes do Mintly (até 12 meses), para o RBT12. Ausente = nenhum informado. */
  revenueBeforeMintly: revenueBeforeSchema.optional(),
  /**
   * Perfil de venda de cada categoria do cardápio (elasticidade padrão do simulador de preço). Gravado pela rota
   * `PUT /menu-items/category-profiles` (dono ou gerente), não pelo PATCH do restaurante. Ausente = nenhum escolhido.
   */
  menuCategoryProfiles: s.array(menuCategoryProfileSchema).max(MENU_CATEGORY_PROFILES_MAX).optional(),
  audit: auditSchema,
})

// Corpo do PATCH /restaurants/me. Objeto estrito: audit e qualquer outro campo
// são rejeitados (mass assignment).
export const restaurantUpdateSchema = s.object({
  name: s.string(),
  taxRegime: s.type().enum(TaxRegime),
  /** Substitui a lista inteira. */
  team: teamSchema,
  /** String vazia apaga. */
  activityStart: activityStartSchema,
  /** Substitui a lista inteira ([] apaga). */
  revenueBeforeMintly: revenueBeforeSchema,
}).partial()
