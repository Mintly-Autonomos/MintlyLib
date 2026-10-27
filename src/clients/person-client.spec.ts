import { PersonClient } from './person-client'

describe('PersonClient', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })
  const headers = { env: 'staging', authorization: 'Bearer t' } as any

  it('getAvatarByUsername faz GET /avatar/:username com o e-mail codificado', async () => {
    const client = new PersonClient()
    const get = jest.spyOn(client.connection, 'get').mockResolvedValue({ data: { payload: { avatar: null } } } as any)

    const result = await client.getAvatarByUsername('ana+teste@exemplo.com', headers)

    expect(get).toHaveBeenCalledWith('/avatar/ana%2Bteste%40exemplo.com', expect.anything())
    expect(result.payload).toEqual({ avatar: null })
  })

  it('updateMyAvatar faz PUT /me/avatar com o corpo', async () => {
    const client = new PersonClient()
    const put = jest.spyOn(client.connection, 'put').mockResolvedValue({ data: { payload: { avatar: 'data:image/png;base64,AAAA' } } } as any)

    const result = await client.updateMyAvatar({ avatar: 'data:image/png;base64,AAAA' }, headers)

    expect(put).toHaveBeenCalledWith('/me/avatar', { avatar: 'data:image/png;base64,AAAA' }, expect.anything())
    expect(result.payload?.avatar).toBe('data:image/png;base64,AAAA')
  })

  it('removeMyAvatar faz DELETE /me/avatar', async () => {
    const client = new PersonClient()
    const del = jest.spyOn(client.connection, 'delete').mockResolvedValue({ data: { payload: { avatar: null } } } as any)

    const result = await client.removeMyAvatar(headers)

    expect(del).toHaveBeenCalledWith('/me/avatar', expect.anything())
    expect(result.payload).toEqual({ avatar: null })
  })
})
