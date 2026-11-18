import {
  DEFAULT_SALES_PROFILE,
  menuCategoryProfilesUpdateSchema,
  MENU_CATEGORY_PROFILES_MAX,
  PRICE_SENSITIVITY_ELASTICITY,
  PriceSensitivity,
  SALES_PROFILE_ELASTICITY,
  SalesProfile,
  suggestSalesProfile,
} from './sales-profile'
import { menuItemSchema, menuItemUpdateSchema } from './menu-item-schema'
import { restaurantSchema, restaurantUpdateSchema } from '../restaurant/restaurant-schema'

describe('perfil de venda por categoria (elasticidade padrão)', () => {
  it('elasticidades: balcão −2,0, dia a dia −1,5, bebida −1,2, encomenda −1,0; prato: −1,2 / −1,8 / −2,5', () => {
    expect(SALES_PROFILE_ELASTICITY).toEqual({ counter: -2, everyday: -1.5, drink: -1.2, order: -1 })
    expect(PRICE_SENSITIVITY_ELASTICITY).toEqual({ low: -1.2, medium: -1.8, high: -2.5 })
    expect(DEFAULT_SALES_PROFILE).toBe(SalesProfile.Everyday)
  })

  it.each([
    ['Bebidas', SalesProfile.Drink],
    ['Cafés', SalesProfile.Drink],
    ['Sucos naturais', SalesProfile.Drink],
    ['Encomendas', SalesProfile.Order],
    ['Bolos de festa', SalesProfile.Order],
    ['Kits corporativos', SalesProfile.Order],
    ['Doces', SalesProfile.Counter],
    ['Salgados', SalesProfile.Counter],
    ['Fatias', SalesProfile.Counter],
    ['BRIGADEIROS', SalesProfile.Counter],
    ['Pratos executivos', SalesProfile.Everyday],
    ['Frango', SalesProfile.Everyday],
    ['', SalesProfile.Everyday],
  ])('"%s" sugere %s', (nome, perfil) => {
    expect(suggestSalesProfile(nome)).toBe(perfil)
  })

  it('sem categoria: dia a dia', () => {
    expect(suggestSalesProfile(null)).toBe(SalesProfile.Everyday)
    expect(suggestSalesProfile(undefined)).toBe(SalesProfile.Everyday)
  })

  it('PUT dos perfis: lista inteira, categoria de 1 a 40 caracteres, perfil válido, até 100', () => {
    expect(menuCategoryProfilesUpdateSchema.safeParse({ profiles: [{ category: 'Bebidas', profile: 'drink' }] }).success).toBe(true)
    expect(menuCategoryProfilesUpdateSchema.safeParse({ profiles: [] }).success).toBe(true)
    expect(menuCategoryProfilesUpdateSchema.safeParse({ profiles: [{ category: '', profile: 'drink' }] }).success).toBe(false)
    expect(menuCategoryProfilesUpdateSchema.safeParse({ profiles: [{ category: 'X'.repeat(41), profile: 'drink' }] }).success).toBe(false)
    expect(menuCategoryProfilesUpdateSchema.safeParse({ profiles: [{ category: 'Bebidas', profile: 'cerveja' }] }).success).toBe(false)
    const muitos = Array.from({ length: MENU_CATEGORY_PROFILES_MAX + 1 }, (_, i) => ({ category: `C${i}`, profile: 'order' }))
    expect(menuCategoryProfilesUpdateSchema.safeParse({ profiles: muitos }).success).toBe(false)
  })

  it('o prato aceita a própria sensibilidade (opcional); o PATCH do restaurante não grava perfis', () => {
    const audit = { createdAt: new Date(), updatedAt: new Date() }
    const prato = {
      restaurantId: 'r',
      name: 'Cheesecake',
      price: 22,
      cost: 7.8,
      soldPerMonth: 84,
      status: 'active',
      priceUpdatedAt: new Date(),
      priceReviewedAt: new Date(),
      audit,
    }
    expect(menuItemSchema.safeParse(prato).success).toBe(true)
    expect(menuItemSchema.safeParse({ ...prato, priceSensitivity: PriceSensitivity.High }).success).toBe(true)
    expect(menuItemSchema.safeParse({ ...prato, priceSensitivity: 'altissima' }).success).toBe(false)
    expect(menuItemUpdateSchema.safeParse({ priceSensitivity: 'low' }).success).toBe(true)
    expect(restaurantSchema.safeParse({ name: 'Cantina', audit, menuCategoryProfiles: [{ category: 'Bebidas', profile: 'drink' }] }).success).toBe(true)
    expect(restaurantUpdateSchema.safeParse({ menuCategoryProfiles: [] }).success).toBe(false)
  })
})
