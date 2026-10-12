import type { TaxRegime } from './restaurant-schema'
import type { Restaurant } from './restaurant-entity'

/** Faixa do Anexo I do Simples Nacional (MIN-23). `upTo` inclusivo. */
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
}
