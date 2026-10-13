import { RestaurantClient } from './restaurant-client'
import { TaxRegime } from '../core/data/restaurant/restaurant-schema'

describe('RestaurantClient', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })
  const headers = { env: 'staging', authorization: 'Bearer t' } as any

  it('me faz GET /me com o mês na query', async () => {
    const client = new RestaurantClient()
    const get = jest.spyOn((client as any).http.connection, 'get').mockResolvedValue({ data: { payload: {} } } as any)

    await client.me({ month: '2026-10' }, headers)

    expect(get).toHaveBeenCalledWith('/me', expect.objectContaining({ params: { month: '2026-10' } }))
  })

  it('updateMe faz PATCH /me com o corpo', async () => {
    const client = new RestaurantClient()
    const patch = jest.spyOn((client as any).http.connection, 'patch').mockResolvedValue({ data: { payload: {} } } as any)

    await client.updateMe({ taxRegime: TaxRegime.Mei }, headers)

    expect(patch).toHaveBeenCalledWith('/me', { taxRegime: TaxRegime.Mei }, expect.anything())
  })

  it('não expõe CRUD genérico (as rotas não existem)', () => {
    const c = new RestaurantClient() as any
    expect(c.insert).toBeUndefined()
    expect(c.findAll).toBeUndefined()
    expect(c.findById).toBeUndefined()
  })
})
