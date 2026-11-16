import { FinancialAccountType } from './financial-account-schema'
import { PaymentMethod } from './financial-movement-schema'
import { PlatformKind } from './platform-kind'
import type { FeeByMethod } from './platform-kind'

/** Formas de pagamento que podem ter taxa própria numa conta plataforma. */
export const FEE_PAYMENT_METHODS = [
  PaymentMethod.Debit,
  PaymentMethod.Credit,
  PaymentMethod.Pix,
  PaymentMethod.DigitalWallet,
] as const

/** O que a regra precisa da conta. */
export interface PlatformFeeAccount {
  type: string
  feePercent?: number
  feeByMethod?: FeeByMethod | null
  platformKind?: PlatformKind | string | null
}

/** Tipo da plataforma; `null` quando a conta não é plataforma. Sem o campo, `marketplace`. */
export function platformKindOf (account: PlatformFeeAccount): PlatformKind | null {
  if (account.type !== FinancialAccountType.Platform) return null
  return account.platformKind === PlatformKind.CardMachine ? PlatformKind.CardMachine : PlatformKind.Marketplace
}

/**
 * Taxa (%) que a conta cobra numa venda com esta forma de pagamento: a da forma, se houver; senão o
 * `feePercent`. `undefined` quando a conta não é plataforma (não cobra taxa).
 */
export function platformFeePercent (account: PlatformFeeAccount, method?: PaymentMethod | string | null): number | undefined {
  if (account.type !== FinancialAccountType.Platform) return undefined
  const byMethod = method != null ? (account.feeByMethod as Record<string, number | undefined> | null | undefined)?.[method] : undefined
  return byMethod ?? account.feePercent
}
