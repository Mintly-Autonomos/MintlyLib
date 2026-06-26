import { Sapphire } from '@ascendance-hub/sapphire-core'
import { RecordStatus } from '../common/status'
import { auditSchema } from '../common/audit'

const s = new Sapphire()

export enum FinancialAccountType {
  Bank = 'bank',
  Cash = 'cash',
  DigitalWallet = 'digitalWallet',
  Platform = 'platform',
}

export const baseAccountSchema = s.object({
  restaurantId: s.string(),
  name: s.string(),
  status: s.type().enum(RecordStatus),
  isDefault: s.boolean(),
  availableBalance: s.number().default(0),
  predictedBalance: s.number().default(0),
  history: s.array(
    s.object({
      at: s.date().coerce(),
      by: s.string(),
      action: s.string(),
      detail: s.string().optional(),
    }),
  ).default([]),
  audit: auditSchema,
})
// validação condicional
// 2. A CONTA PLATAFORMA (Exige type platform + taxas obrigatórias)
// O .extend() sobrescreve a base adicionando essas regras estritas
const platformAccountSchema = baseAccountSchema.extend({
  type: s.type().literal(FinancialAccountType.Platform), // Força a ser 'platform'
  feePercent: s.number().int().min(0), // Obrigatório
  settlementDays: s.number().int().min(0), // Obrigatório
})

// 3. AS OUTRAS CONTAS (Proíbem as taxas)
const standardAccountSchema = baseAccountSchema.extend({
  type: s.type().enum([
    FinancialAccountType.Bank,
    FinancialAccountType.Cash,
    FinancialAccountType.DigitalWallet,
  ]),
  // Não colocamos feePercent e settlementDays aqui.
  // Se o usuário enviar, o Sapphire vai recusar.
})

// 4. A EXPORTAÇÃO FINAL (CRIAÇÃO)
// Dizemos para a API: "A conta tem que ser OU plataforma OU padrão" - união discriminada
export const financialAccountSchema = s.type().union([
  platformAccountSchema,
  standardAccountSchema,
])

// 5. SCHEMA DE EDIÇÃO PARCIAL (PATCH / update)
// Por que um schema separado em vez de reaproveitar o de cima:
//  - O de criação é uma UNIÃO discriminada; união não tem .partial() no Sapphire,
//    e num PATCH o `type` pode nem vir, então a regra cruzada (platform exige
//    fee/prazo) não é verificável aqui — ela continua valendo só na criação.
//  - Aqui usamos um OBJETO achatado + .partial(): todo campo vira opcional, mas
//    o que for enviado é validado (ex.: feePercent inteiro e >= 0).
//  - Listamos APENAS os campos editáveis. restaurantId, isDefault, saldos
//    (availableBalance/predictedBalance), history e audit ficam de fora de
//    propósito: como o objeto é estrito, enviá-los num PATCH é rejeitado
//    (protege tenant e os valores computados pelo sistema).
export const financialAccountUpdateSchema = s.object({
  name: s.string(),
  status: s.type().enum(RecordStatus),
  type: s.type().enum(FinancialAccountType),
  feePercent: s.number().int().min(0),
  settlementDays: s.number().int().min(0),
}).partial()
