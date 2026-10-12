import * as financial from './index'
import * as root from '../../../index'

// O barrel exporta nome por nome: enum novo que não entra aqui some para os
// consumidores (a API importa de 'mintly-lib').
describe('barrel de financial', () => {
  it('exporta DreGroup e CategoryBehavior.Mixed', () => {
    expect(financial.DreGroup).toBeDefined()
    expect((root as any).DreGroup?.Cmv).toBe('cmv')
    expect(financial.CategoryBehavior.Mixed).toBe('mixed')
  })
})
