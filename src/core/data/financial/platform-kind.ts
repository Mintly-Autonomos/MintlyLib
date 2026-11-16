import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/**
 * Que tipo de plataforma a conta é (relatório Sweetie Bel, S3.3). Muda o canal padrão das vendas e a
 * linha da taxa nos relatórios:
 * - `marketplace`: app de delivery (iFood, Keeta, 99…). Venda é delivery; a taxa é "comissão de app".
 * - `cardMachine`: maquininha de cartão (Stone, PagSeguro, Cielo…). Venda é salão; a taxa é "taxa da maquininha".
 * Conta plataforma sem o campo (as antigas) é `marketplace`.
 */
export enum PlatformKind {
  Marketplace = 'marketplace',
  CardMachine = 'cardMachine',
}

const pct = () => s.number().min(0).max(100)

/**
 * Taxa (%) por forma de pagamento, por cima do `feePercent` da conta. Ex.: maquininha com débito 1,2%,
 * crédito 3,1% e Pix 0,8%. A forma que não estiver aqui usa o `feePercent`. As chaves são os valores de
 * `PaymentMethod` (debit, credit, pix, digitalWallet).
 */
export const feeByMethodSchema = s.object({
  debit: pct(),
  credit: pct(),
  pix: pct(),
  digitalWallet: pct(),
}).partial()

export type FeeByMethod = Infer<typeof feeByMethodSchema>
