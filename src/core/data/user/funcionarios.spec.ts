import {
  accessLevelOf,
  canManageSetup,
  canSeePersonnel,
  canViewReports,
  MemberProfile,
  MEMBER_PROFILE_DEFAULT,
  MEMBER_PROFILE_LABEL,
  UserRole,
  UserStatus,
  userSchema,
} from './index'
import * as lib from '../../../index'
import { AuthClient } from '../../../clients/auth-client'

// E.1–E.3 do relatório Sweetie Bel: convite, exclusão e perfis de funcionário.

describe('perfis de funcionário (E.3)', () => {
  it('dono é dono; funcionário sem perfil gravado continua Gerente', () => {
    expect(accessLevelOf({ role: UserRole.Owner })).toBe('owner')
    expect(accessLevelOf({ role: UserRole.Owner, memberProfile: MemberProfile.Operations })).toBe('owner')
    expect(accessLevelOf({ role: UserRole.Member })).toBe(MemberProfile.Manager)
    expect(accessLevelOf({ role: UserRole.Member, memberProfile: null })).toBe(MEMBER_PROFILE_DEFAULT)
    expect(accessLevelOf({ role: UserRole.Member, memberProfile: 'outro' })).toBe(MemberProfile.Manager)
    expect(accessLevelOf({ role: UserRole.Member, memberProfile: MemberProfile.Operations })).toBe(MemberProfile.Operations)
  })

  it('Operação não vê relatórios, não muda cadastros e não vê pessoal; Gerente e dono podem tudo isso', () => {
    for (const level of ['owner', MemberProfile.Manager] as const) {
      expect([canViewReports(level), canManageSetup(level), canSeePersonnel(level)]).toEqual([true, true, true])
    }
    const op = MemberProfile.Operations
    expect([canViewReports(op), canManageSetup(op), canSeePersonnel(op)]).toEqual([false, false, false])
  })

  it('nomes na tela', () => {
    expect(MEMBER_PROFILE_LABEL).toEqual({ operations: 'Operação', manager: 'Gerente' })
  })
})

describe('usuário: perfil e situações novas (E.1–E.3)', () => {
  const base = {
    person: { _id: 'p1', name: 'Ana' },
    email: 'ana@teste.com',
    passwordHash: '',
    role: UserRole.Member,
    restaurantId: 'r1',
    audit: { createdAt: new Date(), updatedAt: new Date() },
  }

  it('convidado e excluído são situações válidas, com perfil opcional', () => {
    expect(userSchema.safeParse({ ...base, status: UserStatus.Invited, memberProfile: MemberProfile.Operations }).success).toBe(true)
    expect(userSchema.safeParse({ ...base, status: UserStatus.Removed }).success).toBe(true)
    expect(userSchema.safeParse({ ...base, status: UserStatus.Active, memberProfile: 'admin' }).success).toBe(false)
  })
})

describe('convite (E.1)', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })
  const headers = { env: 'staging' } as any

  it('invitePreview e acceptInvite fazem POST em /invite/preview e /invite/accept', async () => {
    const client = new AuthClient()
    const post = jest.spyOn((client as any).connection, 'post').mockResolvedValue({ data: { payload: {} } } as any)

    await client.invitePreview('tok', headers)
    await client.acceptInvite({ token: 'tok', newPassword: 'Senha#12345', confirmNewPassword: 'Senha#12345' }, headers)

    expect(post).toHaveBeenCalledWith('/invite/preview', { token: 'tok' }, expect.anything())
    expect(post).toHaveBeenCalledWith('/invite/accept', { token: 'tok', newPassword: 'Senha#12345', confirmNewPassword: 'Senha#12345' }, expect.anything())
  })

  it('exporta tudo pela raiz da lib', () => {
    expect(lib.MEMBER_INVITE_EXPIRY_DAYS).toBe(7)
    expect(lib.MemberStatus.Invited).toBe('invited')
    expect(lib.UserStatus.Removed).toBe('removed')
    expect(lib.MemberProfile.Operations).toBe('operations')
    expect(typeof lib.accessLevelOf).toBe('function')
    expect(typeof lib.canViewReports).toBe('function')
  })
})
