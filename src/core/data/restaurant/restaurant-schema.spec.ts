import { restaurantSchema, restaurantUpdateSchema, TaxRegime } from './restaurant-schema'

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

describe('restaurantUpdateSchema', () => {
  it('aceita nome e regime, ambos opcionais', () => {
    expect(restaurantUpdateSchema.safeParse({}).success).toBe(true)
    expect(restaurantUpdateSchema.safeParse({ taxRegime: TaxRegime.SimplesNacionalAnexoI }).success).toBe(true)
    expect(restaurantUpdateSchema.safeParse({ name: 'Novo nome' }).success).toBe(true)
  })

  it('é estrito: campo desconhecido é rejeitado', () => {
    expect(restaurantUpdateSchema.safeParse({ audit }).success).toBe(false)
  })
})
