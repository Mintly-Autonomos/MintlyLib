import type { TaxRegime } from './restaurant-schema'
import type { Restaurant, RevenueBeforeMintly, TeamMember } from './restaurant-entity'

/** Faixa da tabela do Simples Nacional (Anexo I ou II, conforme o regime). `upTo` inclusivo. */
export interface TaxBracket {
  index: number
  upTo: number
  nominalRate: number
  deduction: number
}

/** Alertas determinísticos da MIN-23 (sem notificação persistida). */
export type TaxInsight =
  | { kind: 'bracketChanged'; severity: 'warning'; fromBracket: number; toBracket: number; fromRate: number; toRate: number; rbt12: number }
  | { kind: 'meiCapNear'; severity: 'warning'; usedPct: number; yearToDateRevenue: number; annualLimit: number }
  | { kind: 'simplesLimitExceeded'; severity: 'warning'; rbt12: number }
  | { kind: 'taxRegimeNotConfigured'; severity: 'info' }

/** Perfil tributário do restaurante num mês. Taxas são frações (0.06728 = 6,728%). */
export interface RestaurantTaxProfile {
  regime: TaxRegime | null
  referenceMonth: string
  rbt12: number
  monthsOfHistory: number
  rbt12Proportional: boolean
  /**
   * Primeiro mês de atividade usado no RBT12: o `activityStart` informado ou, sem ele, o primeiro mês com venda.
   * null = nenhuma venda ainda.
   */
  activityStartMonth: string | null
  effectiveRate: number | null
  bracket: TaxBracket | null
  previousBracketIndex: number | null
  meiMonthlyDas: number | null
  meiCap: { annualLimit: number; yearToDateRevenue: number; usedPct: number } | null
  insights: TaxInsight[]
}

/** Query de GET /restaurants/me — `month` em `AAAA-MM`, padrão o mês corrente. */
export interface RestaurantProfileQuery {
  month?: string
}

export interface RestaurantProfileResponse {
  restaurant: Restaurant
  tax: RestaurantTaxProfile
}

/** Corpo de PATCH /restaurants/me. */
export interface RestaurantUpdateRequest {
  name?: string
  taxRegime?: TaxRegime
  /** Equipe e carga semanal (P.4). Substitui a lista inteira. */
  team?: TeamMember[]
  /** Mês de abertura (`AAAA-MM`); "" apaga. */
  activityStart?: string
  /** Faturamento antes do Mintly (até 12 meses). Substitui a lista inteira; [] apaga. */
  revenueBeforeMintly?: RevenueBeforeMintly[]
}
