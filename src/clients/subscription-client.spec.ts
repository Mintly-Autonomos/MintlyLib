import { SubscriptionClient } from './subscription-client'

describe('SubscriptionClient', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })

  it('expõe só overview, checkout e mockDecide; sem CRUD genérico', () => {
    const c = new SubscriptionClient() as any
    expect(typeof c.overview).toBe('function')
    expect(typeof c.checkout).toBe('function')
    expect(typeof c.mockDecide).toBe('function')
    expect(c.insert).toBeUndefined()
    expect(c.findAll).toBeUndefined()
    expect(c.findById).toBeUndefined()
    expect(c.delete).toBeUndefined()
  })
})
