import { Sapphire } from '@ascendance-hub/sapphire-core'
import type { Infer } from '@ascendance-hub/sapphire-core'

const s = new Sapphire()

/**
 * Perfil de venda da categoria do cardápio (relatório Sweetie Bel, 12.7): diz quão sensível a preço o cliente
 * costuma ser, e dá a elasticidade padrão do simulador de preço. O prato herda o perfil da categoria e pode ter
 * a própria sensibilidade (`priceSensitivity`). Ordem usada pelo simulador: a medida no último reajuste, depois a
 * do prato, depois a da categoria, por fim "dia a dia".
 */
export enum SalesProfile {
  /** Doce, salgado ou fatia do balcão: compra por impulso, troca fácil de produto. */
  Counter = 'counter',
  /** Prato ou lanche do dia a dia. */
  Everyday = 'everyday',
  /** Bebida e café. */
  Drink = 'drink',
  /** Encomenda, bolo de festa, kit: compra planejada, cliente fiel. */
  Order = 'order',
}

export const DEFAULT_SALES_PROFILE = SalesProfile.Everyday

/** Elasticidade-preço de cada perfil (quanto o volume cai quando o preço sobe 1%). */
export const SALES_PROFILE_ELASTICITY: Record<SalesProfile, number> = {
  [SalesProfile.Counter]: -2.0,
  [SalesProfile.Everyday]: -1.5,
  [SalesProfile.Drink]: -1.2,
  [SalesProfile.Order]: -1.0,
}

export const SALES_PROFILE_LABEL: Record<SalesProfile, string> = {
  [SalesProfile.Counter]: 'Balcão / impulso',
  [SalesProfile.Everyday]: 'Dia a dia',
  [SalesProfile.Drink]: 'Bebida',
  [SalesProfile.Order]: 'Encomenda',
}

/** Sensibilidade a preço escolhida no próprio prato (sobrepõe o perfil da categoria). */
export enum PriceSensitivity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export const PRICE_SENSITIVITY_ELASTICITY: Record<PriceSensitivity, number> = {
  [PriceSensitivity.Low]: -1.2,
  [PriceSensitivity.Medium]: -1.8,
  [PriceSensitivity.High]: -2.5,
}

const PALAVRAS: Array<[SalesProfile, RegExp]> = [
  [SalesProfile.Order, /\b(encomenda|festa|aniversario|kit|cesta|torta inteira|bolo inteiro|bolos? de|buffet|evento|panetone|ovo de pascoa|ovos de pascoa)/],
  [SalesProfile.Drink, /\b(bebida|cafe|cafes|suco|refri|refrigerante|cha|chas|agua|cerveja|drink|vinho|milkshake|smoothie|capuccino|cappuccino|latte|expresso)/],
  [SalesProfile.Counter, /\b(doce|doces|salgado|salgados|fatia|brigadeiro|bombom|cookie|biscoito|sobremesa|confeitaria|balcao|cupcake|brownie|trufa|pao de mel|empada|coxinha|esfiha|pastel)/],
]

/** Perfil sugerido pelo nome da categoria (sem acento, sem caixa). Sem pista, "dia a dia". */
export function suggestSalesProfile (category: string | null | undefined): SalesProfile {
  const nome = (category ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  for (const [perfil, re] of PALAVRAS) if (re.test(nome)) return perfil
  return DEFAULT_SALES_PROFILE
}

export const MENU_CATEGORY_PROFILES_MAX = 100

/** Perfil escolhido para uma categoria do cardápio (o nome é o mesmo texto da categoria dos pratos). */
export const menuCategoryProfileSchema = s.object({
  category: s.string().min(1, { message: 'Informe a categoria.' }).max(40, { message: 'A categoria tem no máximo 40 caracteres.' }),
  profile: s.type().enum(SalesProfile),
})

/** Corpo de `PUT /menu-items/category-profiles`: a lista inteira dos perfis escolhidos. */
export const menuCategoryProfilesUpdateSchema = s.object({
  profiles: s.array(menuCategoryProfileSchema).max(MENU_CATEGORY_PROFILES_MAX, {
    message: `No máximo ${MENU_CATEGORY_PROFILES_MAX} categorias.`,
  }),
})

export type MenuCategoryProfile = Infer<typeof menuCategoryProfileSchema>
export type MenuCategoryProfilesUpdateRequest = Infer<typeof menuCategoryProfilesUpdateSchema>

/** Resposta de `GET`/`PUT /menu-items/category-profiles`. */
export interface MenuCategoryProfilesResponse {
  profiles: MenuCategoryProfile[]
}
