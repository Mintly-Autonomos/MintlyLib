import { restaurantSchema, restaurantUpdateSchema, teamMemberSchema, TaxRegime, TEAM_MAX_MEMBERS, TEAM_MAX_WEEKLY_HOURS } from './restaurant-schema'

const audit = { createdAt: new Date('2026-10-01T00:00:00.000Z'), updatedAt: new Date('2026-10-01T00:00:00.000Z') }

describe('restaurantSchema (fatia 3)', () => {
  it('regime é opcional', () => {
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit }).success).toBe(true)
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, taxRegime: TaxRegime.Mei }).success).toBe(true)
  })

  it('rejeita regime desconhecido', () => {
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, taxRegime: 'lucroReal' }).success).toBe(false)
  })
})

describe('firstAccessAt (primeiro acesso)', () => {
  it('é opcional no restaurante (os antigos não têm) e é uma data', () => {
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit }).success).toBe(true)
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, firstAccessAt: new Date('2026-11-02') }).success).toBe(true)
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, firstAccessAt: 'ontem' }).success).toBe(false)
  })

  it('o PATCH NÃO aceita o campo: quem preenche é o servidor, ao concluir o onboarding', () => {
    expect(restaurantUpdateSchema.safeParse({ firstAccessAt: new Date() }).success).toBe(false)
  })
})

describe('restaurantUpdateSchema', () => {
  it('aceita nome e regime, ambos opcionais', () => {
    expect(restaurantUpdateSchema.safeParse({}).success).toBe(true)
    expect(restaurantUpdateSchema.safeParse({ taxRegime: TaxRegime.SimplesNacionalAnexoI }).success).toBe(true)
    expect(restaurantUpdateSchema.safeParse({ taxRegime: TaxRegime.SimplesNacionalAnexoII }).success).toBe(true)
    expect(TaxRegime.SimplesNacionalAnexoII).toBe('simplesNacionalAnexoII')
    expect(restaurantUpdateSchema.safeParse({ name: 'Novo nome' }).success).toBe(true)
  })

  it('é estrito: campo desconhecido é rejeitado', () => {
    expect(restaurantUpdateSchema.safeParse({ audit }).success).toBe(false)
  })
})

describe('team (P.4: equipe e carga semanal)', () => {
  const pessoa = { name: 'Ana', weeklyHours: 44 }

  it('é opcional no restaurante e aceita nome + horas por semana', () => {
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit }).success).toBe(true)
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, team: [pessoa, { name: 'Dona', weeklyHours: 60 }] }).success).toBe(true)
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, team: [] }).success).toBe(true)
  })

  it('o PATCH troca a lista inteira e valida cada pessoa', () => {
    expect(restaurantUpdateSchema.safeParse({ team: [pessoa] }).success).toBe(true)
    expect(restaurantUpdateSchema.safeParse({ team: [{ name: '', weeklyHours: 44 }] }).success).toBe(false)
    expect(restaurantUpdateSchema.safeParse({ team: [{ name: 'Ana', weeklyHours: 0 }] }).success).toBe(false)
    expect(restaurantUpdateSchema.safeParse({ team: [{ name: 'Ana', weeklyHours: TEAM_MAX_WEEKLY_HOURS + 1 }] }).success).toBe(false)
    expect(restaurantUpdateSchema.safeParse({ team: [{ name: 'Ana' }] }).success).toBe(false)
  })

  it('aceita meio período fracionado e limita o tamanho da equipe', () => {
    expect(teamMemberSchema.safeParse({ name: 'Bia', weeklyHours: 22.5 }).success).toBe(true)
    const muitos = Array.from({ length: TEAM_MAX_MEMBERS + 1 }, (_, i) => ({ name: `P${i}`, weeklyHours: 10 }))
    expect(restaurantUpdateSchema.safeParse({ team: muitos }).success).toBe(false)
  })
})
