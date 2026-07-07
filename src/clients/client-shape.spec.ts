import { FinancialAccountClient } from './financial-account-client'
import { FinancialCategoryClient } from './financial-category-client'
import { FinancialMovementClient } from './financial-movement-client'
import { PersonClient } from './person-client'

// A10: os clients de CRUD parcial (compostos) NÃO devem expor operações que a
// rota não tem (findById/delete → 404 em runtime). Person, de CRUD completo,
// segue expondo tudo (estende o base).

describe('forma dos clients (A10)', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })

  it('FinancialAccountClient: expõe insert/find/findAll/update + ações; sem findById/delete', () => {
    const c = new FinancialAccountClient() as any
    expect(typeof c.insert).toBe('function')
    expect(typeof c.find).toBe('function')
    expect(typeof c.findAll).toBe('function')
    expect(typeof c.update).toBe('function')
    expect(typeof c.defaultUpdate).toBe('function')
    expect(c.findById).toBeUndefined()
    expect(c.delete).toBeUndefined()
  })

  it('FinancialCategoryClient: sem findById/delete', () => {
    const c = new FinancialCategoryClient() as any
    expect(typeof c.insert).toBe('function')
    expect(typeof c.suggestions).toBe('function')
    expect(c.findById).toBeUndefined()
    expect(c.delete).toBeUndefined()
  })

  it('FinancialMovementClient: só métodos próprios (register/list/...); sem CRUD genérico', () => {
    const c = new FinancialMovementClient() as any
    expect(typeof c.register).toBe('function')
    expect(typeof c.list).toBe('function')
    expect(typeof c.changeStatus).toBe('function')
    expect(c.insert).toBeUndefined()
    expect(c.findAll).toBeUndefined()
    expect(c.findById).toBeUndefined()
    expect(c.delete).toBeUndefined()
  })

  it('PersonClient: CRUD completo (estende o base)', () => {
    const c = new PersonClient() as any
    expect(typeof c.insert).toBe('function')
    expect(typeof c.findById).toBe('function')
    expect(typeof c.delete).toBe('function')
  })
})
