import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/** Como uma plataforma (iFood, Keeta, 99…) repassa o dinheiro das vendas. */
export enum SettlementRuleKind {
  /** N dias depois da venda (0 = cai na hora). */
  AfterDays = 'afterDays',
  /** Toda semana, num dia da semana. */
  Weekly = 'weekly',
  /** Duas vezes por mês, em dois dias do mês. */
  Biweekly = 'biweekly',
  /** Uma vez por mês, num dia do mês. */
  Monthly = 'monthly',
}

export const settlementRuleSchema = s.type().union([
  s.object({
    kind: s.type().literal(SettlementRuleKind.AfterDays),
    days: s.number().int().min(0).max(365),
  }),
  s.object({
    kind: s.type().literal(SettlementRuleKind.Weekly),
    /** 0 = domingo … 6 = sábado (igual ao `Date#getDay`). */
    weekday: s.number().int().min(0).max(6),
  }),
  s.object({
    kind: s.type().literal(SettlementRuleKind.Biweekly),
    firstDay: s.number().int().min(1).max(31),
    secondDay: s.number().int().min(1).max(31),
  }),
  s.object({
    kind: s.type().literal(SettlementRuleKind.Monthly),
    day: s.number().int().min(1).max(31),
  }),
])

export type SettlementRule = Infer<typeof settlementRuleSchema>

const DAY_MS = 24 * 60 * 60 * 1000
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

const WEEKLY_LABEL = [
  'Todo domingo',
  'Toda segunda-feira',
  'Toda terça-feira',
  'Toda quarta-feira',
  'Toda quinta-feira',
  'Toda sexta-feira',
  'Todo sábado',
]

/** Nome do dia da semana (0 = domingo) para mostrar na tela: "quarta". */
export function weekdayName (weekday: number): string {
  return WEEKDAYS[weekday] ?? ''
}

/**
 * A regra efetiva de uma conta: a `settlementRule` quando existe; senão o `settlementDays` antigo
 * (contas criadas antes das regras por dia da semana/mês) vira "N dias após a venda".
 * `null` quando a conta não tem nenhum dos dois.
 */
export function resolveSettlementRule (account: {
  settlementRule?: SettlementRule | null
  settlementDays?: number | null
}): SettlementRule | null {
  if (account.settlementRule) return account.settlementRule
  if (typeof account.settlementDays === 'number') {
    return { kind: SettlementRuleKind.AfterDays, days: account.settlementDays }
  }
  return null
}

/** Mensagem do que está errado na regra, ou `null` se está certa. A forma já é validada pelo schema. */
export function validateSettlementRule (rule: SettlementRule): string | null {
  if (rule.kind === SettlementRuleKind.Biweekly && rule.firstDay === rule.secondDay) {
    return 'Escolha dois dias diferentes do mês para o repasse quinzenal.'
  }
  return null
}

const startOfUtcDay = (d: Date): number => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
const daysInMonth = (year: number, month: number): number => new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

/** O dia `day` do mês (0–11) em UTC; "31" num mês de 30 dias cai no último dia do mês. */
const dayOfMonth = (year: number, month: number, day: number): number =>
  Date.UTC(year, month, Math.min(day, daysInMonth(year, month)))

/**
 * Quando cai o dinheiro de uma venda feita em `saleDate`: o PRIMEIRO dia de repasse DEPOIS do dia da
 * venda. Venda no próprio dia de repasse só cai no repasse seguinte (ex.: repasse toda quarta: venda
 * na terça cai na quarta; venda na quarta cai na quarta da semana seguinte).
 *
 * As datas são lidas como dia do calendário em UTC (o sistema guarda a data da venda à meia-noite UTC).
 * `null` = cai na hora (regra "0 dias após a venda"): não há vencimento a esperar.
 */
export function settlementDueDate (rule: SettlementRule, saleDate: Date): Date | null {
  if (rule.kind === SettlementRuleKind.AfterDays) {
    return rule.days > 0 ? new Date(saleDate.getTime() + rule.days * DAY_MS) : null
  }

  const sale = startOfUtcDay(saleDate)
  const year = saleDate.getUTCFullYear()
  const month = saleDate.getUTCMonth()

  if (rule.kind === SettlementRuleKind.Weekly) {
    const ahead = ((rule.weekday - saleDate.getUTCDay() + 7) % 7) || 7
    return new Date(sale + ahead * DAY_MS)
  }

  const days = rule.kind === SettlementRuleKind.Monthly
    ? [rule.day]
    : [Math.min(rule.firstDay, rule.secondDay), Math.max(rule.firstDay, rule.secondDay)]
  const thisMonth = days.map((d) => dayOfMonth(year, month, d)).find((t) => t > sale)
  if (thisMonth !== undefined) return new Date(thisMonth)
  return new Date(dayOfMonth(year, month + 1, days[0] ?? 1))
}

/** A regra em palavras, para a tela: "Toda quarta-feira", "Dias 5 e 20 de cada mês"… */
export function describeSettlementRule (rule: SettlementRule): string {
  switch (rule.kind) {
    case SettlementRuleKind.Weekly:
      return WEEKLY_LABEL[rule.weekday] ?? ''
    case SettlementRuleKind.Biweekly: {
      const [a, b] = [rule.firstDay, rule.secondDay].sort((x, y) => x - y)
      return `Dias ${a} e ${b} de cada mês`
    }
    case SettlementRuleKind.Monthly:
      return `Todo dia ${rule.day} do mês`
    default:
      return rule.days === 0 ? 'No mesmo dia da venda' : rule.days === 1 ? '1 dia após a venda' : `${rule.days} dias após a venda`
  }
}
