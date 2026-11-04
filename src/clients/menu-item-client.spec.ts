import { MenuItemClient } from './menu-item-client'

describe('MenuItemClient', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })
  const headers = { env: 'staging', authorization: 'Bearer t' } as any
  const spy = (client: any, method: 'get' | 'post' | 'patch' | 'delete') => jest.spyOn(client.http.connection, method).mockResolvedValue({ data: { payload: {} } } as any)

  it('insert → POST /', async () => {
    const c = new MenuItemClient()
    const post = spy(c, 'post')
    await c.insert({ name: 'Soju', price: 25 }, headers)
    expect(post).toHaveBeenCalledWith('/', { name: 'Soju', price: 25 }, expect.anything())
  })

  it('updatePrice → PATCH /:id/price com { price }', async () => {
    const c = new MenuItemClient()
    const patch = spy(c, 'patch')
    await c.updatePrice('m1', 41, headers)
    expect(patch).toHaveBeenCalledWith('/m1/price', { price: 41 }, expect.anything())
  })

  it('keepPrice → POST /:id/price-review sem corpo', async () => {
    const c = new MenuItemClient()
    const post = spy(c, 'post')
    await c.keepPrice('m1', headers)
    expect(post).toHaveBeenCalledWith('/m1/price-review', undefined, expect.anything())
  })

  it('priceAlerts → GET /price-alerts', async () => {
    const c = new MenuItemClient()
    const get = spy(c, 'get')
    await c.priceAlerts(headers)
    expect(get).toHaveBeenCalledWith('/price-alerts', expect.anything())
  })

  it('inactivate/reactivate → PATCH /:id/inactivate|reactivate', async () => {
    const c = new MenuItemClient()
    const patch = spy(c, 'patch')
    await c.inactivateUpdate('m1', headers)
    await c.reactivateUpdate('m1', headers)
    expect(patch).toHaveBeenNthCalledWith(1, '/m1/inactivate', undefined, expect.anything())
    expect(patch).toHaveBeenNthCalledWith(2, '/m1/reactivate', undefined, expect.anything())
  })

  it('delete → DELETE /:id (exclui de vez) e devolve a mensagem', async () => {
    const c = new MenuItemClient()
    const del = jest.spyOn((c as any).http.connection, 'delete').mockResolvedValue({ data: { payload: { message: 'ok' } } } as any)
    const res = await c.delete('m1', headers)
    expect(del).toHaveBeenCalledWith('/m1', expect.anything())
    expect(res.payload).toEqual({ message: 'ok' })
  })

  it('não expõe findById (a rota não tem)', () => {
    const c = new MenuItemClient() as any
    expect(c.findById).toBeUndefined()
  })
})
