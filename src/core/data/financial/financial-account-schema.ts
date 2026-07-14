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
  feePercent: s.number().min(0).max(100), // Obrigatório — taxa fracionária (ex.: 12.5%), 0..100
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
//  - O de criação é uma UNIÃO discriminada; união não tem .partial() no Sapphire.
//  - Aqui usamos um OBJETO achatado + .partial(): todo campo vira opcional, mas
//    o que for enviado é validado (ex.: feePercent 0..100).
//  - `type` NÃO está aqui de propósito (P5): o tipo da conta é IMUTÁVEL. Trocá-lo
//    permitiria criar uma conta `platform` sem taxa/prazo (estado que a criação
//    proíbe) e reescreveria o significado do histórico de movimentos, já que
//    defaultStatus/computeSnapshot decidem tudo pelo `type`. Errou o tipo? Inative
//    a conta e crie outra.
//  - A coerência platform ⇔ taxa/prazo num PATCH depende do tipo ARMAZENADO, que o
//    schema não conhece: é validada no lado da API (account-rules.ts).
//  - restaurantId, isDefault, saldos, history e audit ficam de fora: o objeto é
//    estrito, então enviá-los num PATCH é rejeitado.
export const financialAccountUpdateSchema = s.object({
  name: s.string(),
  status: s.type().enum(RecordStatus),
  feePercent: s.number().min(0).max(100),
  settlementDays: s.number().int().min(0),
}).partial()

// 6. SCHEMA DE INSERT (POST /financial-accounts)
// Como o de criação, é uma UNIÃO discriminada por `type` (platform exige
// fee/prazo; os outros proíbem). Os campos que o servidor COMPUTA/FORÇA ficam
// FORA do schema (objeto estrito → enviá-los é rejeitado): isDefault (sempre
// false no insert; padrão é via SetDefault), availableBalance/predictedBalance
// (sempre 0; saldo só vem de movimentação) e history — assim o client não pode
// injetá-los (A3). audit e restaurantId seguem opcionais: são preenchidos pelo
// servidor (audit resolve o VALIDATION_ERROR; restaurantId vem do RequestContext).
const baseAccountInsertSchema = s.object({
  name: s.string(),
  status: s.type().enum(RecordStatus),
  restaurantId: s.string().optional(),
  audit: auditSchema.optional(),
})

const platformAccountInsertSchema = baseAccountInsertSchema.extend({
  type: s.type().literal(FinancialAccountType.Platform),
  feePercent: s.number().min(0).max(100),
  settlementDays: s.number().int().min(0),
})

const standardAccountInsertSchema = baseAccountInsertSchema.extend({
  type: s.type().enum([
    FinancialAccountType.Bank,
    FinancialAccountType.Cash,
    FinancialAccountType.DigitalWallet,
  ]),
})

export const financialAccountInsertSchema = s.type().union([
  platformAccountInsertSchema,
  standardAccountInsertSchema,
])
