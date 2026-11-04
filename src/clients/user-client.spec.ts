import { UserClient } from './user-client'
import { MasterClient } from '../core/client/master-client'

describe('UserClient', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })
  const headers = { env: 'staging', authorization: 'Bearer t' } as any

  it('getMe faz GET /me', async () => {
    const client = new UserClient()
    const get = jest.spyOn((client as any).http.connection, 'get').mockResolvedValue({ data: { payload: {} } } as any)

    await client.getMe(headers)

    expect(get).toHaveBeenCalledWith('/me', expect.anything())
  })

  it('updateMe faz PATCH /me com nome e telefone', async () => {
    const client = new UserClient()
    const patch = jest.spyOn((client as any).http.connection, 'patch').mockResolvedValue({ data: { payload: {} } } as any)

    await client.updateMe({ name: 'Davi Lee', phone: '11999990000' }, headers)

    expect(patch).toHaveBeenCalledWith('/me', { name: 'Davi Lee', phone: '11999990000' }, expect.anything())
  })

  it('changeEmail faz PATCH /me/email com a senha atual', async () => {
    const client = new UserClient()
    const patch = jest.spyOn((client as any).http.connection, 'patch').mockResolvedValue({ data: { payload: {} } } as any)

    await client.changeEmail({ email: 'novo@teste.com', currentPassword: 'Senha#123' }, headers)

    expect(patch).toHaveBeenCalledWith('/me/email', { email: 'novo@teste.com', currentPassword: 'Senha#123' }, expect.anything())
  })

  it('changePassword faz POST /me/password com a antiga e a nova', async () => {
    const client = new UserClient()
    const post = jest.spyOn((client as any).http.connection, 'post').mockResolvedValue({ data: { payload: {} } } as any)

    await client.changePassword({ currentPassword: 'Antiga#123', newPassword: 'Nova#12345' }, headers)

    expect(post).toHaveBeenCalledWith('/me/password', { currentPassword: 'Antiga#123', newPassword: 'Nova#12345' }, expect.anything())
  })

  it('não expõe CRUD genérico (as rotas não existem)', () => {
    const c = new UserClient() as any
    expect(c.insert).toBeUndefined()
    expect(c.findAll).toBeUndefined()
    expect(c.findById).toBeUndefined()
    expect(c.delete).toBeUndefined()
  })

  it('o MasterClient entrega o userClient', () => {
    expect(new MasterClient().userClient).toBeInstanceOf(UserClient)
  })
})
