import { UserRole } from './user-schema'
import { MEMBER_PROFILE_DEFAULT, MemberProfile } from './member-profile'

/** O que um usuário logado pode fazer: o dono, ou o perfil do funcionário (E.3). */
export type AccessLevel = 'owner' | MemberProfile

/** Nível de acesso de um usuário. Funcionário sem perfil gravado vale `MEMBER_PROFILE_DEFAULT`. */
export function accessLevelOf (user: { role: UserRole | string; memberProfile?: MemberProfile | string | null }): AccessLevel {
  if (user.role === UserRole.Owner) return 'owner'
  return user.memberProfile === MemberProfile.Operations ? MemberProfile.Operations : MEMBER_PROFILE_DEFAULT
}

/** Relatórios e painéis (Visão geral, Fluxo de caixa, Receitas, Custos, Resultado, Previsões, IA). */
export function canViewReports (level: AccessLevel): boolean {
  return level !== MemberProfile.Operations
}

/** Mudar cadastros: contas, categorias, cardápio e saldo inicial. */
export function canManageSetup (level: AccessLevel): boolean {
  return level !== MemberProfile.Operations
}

/** Ver e lançar movimentações de pessoal (categorias do grupo `labor`: salários, pró-labore, encargos). */
export function canSeePersonnel (level: AccessLevel): boolean {
  return level !== MemberProfile.Operations
}
