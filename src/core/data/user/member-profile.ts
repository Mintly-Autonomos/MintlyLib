/**
 * Perfil de acesso de um funcionário (relatório Sweetie Bel, E.3). Sem dependências, para que o schema do
 * usuário e o do funcionário possam importar sem import circular.
 *
 * - `operations` (Operação): registra e vê movimentações (sem as de pessoal: salários, pró-labore e
 *   encargos), vê cardápio, contas e categorias; não vê relatórios nem muda cadastros.
 * - `manager` (Gerente): vê e faz tudo, menos o que é só do dono (assinatura, funcionários, exclusão).
 */
export enum MemberProfile {
  Operations = 'operations',
  Manager = 'manager',
}

/**
 * Perfil de quem não tem o campo: os funcionários criados antes dos perfis já viam tudo, então continuam
 * como Gerente até o dono escolher outro.
 */
export const MEMBER_PROFILE_DEFAULT = MemberProfile.Manager

/** Nome do perfil na tela. */
export const MEMBER_PROFILE_LABEL: Record<MemberProfile, string> = {
  [MemberProfile.Operations]: 'Operação',
  [MemberProfile.Manager]: 'Gerente',
}
