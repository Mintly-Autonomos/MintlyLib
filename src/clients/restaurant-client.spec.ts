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

  it('completeFirstAccess faz POST /me/first-access sem dados', async () => {
    const client = new RestaurantClient()
    const post = jest.spyOn((client as any).http.connection, 'post').mockResolvedValue({ data: { payload: {} } } as any)

    await client.completeFirstAccess(headers)

    expect(post).toHaveBeenCalledWith('/me/first-access', {}, expect.anything())
  })

  it('listMembers faz GET /me/members', async () => {
    const client = new RestaurantClient()
    const get = jest.spyOn((client as any).http.connection, 'get').mockResolvedValue({ data: { payload: [] } } as any)

    await client.listMembers(headers)

    expect(get).toHaveBeenCalledWith('/me/members', expect.anything())
  })

  it('createMember faz POST /me/members com nome, e-mail e senha', async () => {
    const client = new RestaurantClient()
    const post = jest.spyOn((client as any).http.connection, 'post').mockResolvedValue({ data: { payload: {} } } as any)

    await client.createMember({ name: 'Ana', email: 'ana@teste.com', password: 'Senha#12345' }, headers)

    expect(post).toHaveBeenCalledWith('/me/members', { name: 'Ana', email: 'ana@teste.com', password: 'Senha#12345' }, expect.anything())
  })

  it('updateMember faz PATCH /me/members/:id', async () => {
    const client = new RestaurantClient()
    const patch = jest.spyOn((client as any).http.connection, 'patch').mockResolvedValue({ data: { payload: {} } } as any)

    await client.updateMember('abc123', { status: 'inactive' as any }, headers)

    expect(patch).toHaveBeenCalledWith('/me/members/abc123', { status: 'inactive' }, expect.anything())
  })

  it('requestDeletion faz POST /me/deletion-request e cancelDeletion faz DELETE', async () => {
    const client = new RestaurantClient()
    const post = jest.spyOn((client as any).http.connection, 'post').mockResolvedValue({ data: { payload: {} } } as any)
    const del = jest.spyOn((client as any).http.connection, 'delete').mockResolvedValue({ data: { payload: {} } } as any)

    await client.requestDeletion({ password: 'Senha#123', reason: 'Fechei' }, headers)
    await client.cancelDeletion(headers)

    expect(post).toHaveBeenCalledWith('/me/deletion-request', { password: 'Senha#123', reason: 'Fechei' }, expect.anything())
    expect(del).toHaveBeenCalledWith('/me/deletion-request', expect.anything())
  })

  it('não expõe CRUD genérico (as rotas não existem)', () => {
    const c = new RestaurantClient() as any
    expect(c.insert).toBeUndefined()
    expect(c.findAll).toBeUndefined()
    expect(c.findById).toBeUndefined()
  })
})
