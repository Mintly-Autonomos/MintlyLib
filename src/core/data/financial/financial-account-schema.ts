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
      at: s.date(),
      by: s.string(),
      action: s.string(),
      detail: s.string().optional(),
    })
  ).default([]),
  audit: auditSchema,
})
// validação condicional
// 2. A CONTA PLATAFORMA (Exige type platform + taxas obrigatórias)
// O .extend() sobrescreve a base adicionando essas regras estritas
const platformAccountSchema = baseAccountSchema.extend({
  type: s.type().literal(FinancialAccountType.Platform), // Força a ser 'platform'
  feePercent: s.number().int().min(0),       // Obrigatório
  settlementDays: s.number().int().min(0),   // Obrigatório
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

// 4. A EXPORTAÇÃO FINAL
// Dizemos para a API: "A conta tem que ser OU plataforma OU padrão" - união discriminada
export const financialAccountSchema = s.type().union([
  platformAccountSchema, 
  standardAccountSchema
])

// .custom((data: any) => {
//   // Validação Condicional: Plataforma exige taxas e prazos
//   if (data.type === 'platform') {
//     if (data.feePercent === undefined || data.feePercent === null) {
//       throw new Error('feePercent é obrigatório para contas do tipo plataforma');
//     }
//     if (data.settlementDays === undefined || data.settlementDays === null) {
//       throw new Error('settlementDays é obrigatório para contas do tipo plataforma');
//     }
//   } else {
//     // Demais tipos proíbem taxas e prazos
//     if (data.feePercent !== undefined || data.settlementDays !== undefined) {
//       throw new Error(`Os campos feePercent e settlementDays não são permitidos para o tipo ${data.type}`);
//     }
//   }
//   return data
// })

