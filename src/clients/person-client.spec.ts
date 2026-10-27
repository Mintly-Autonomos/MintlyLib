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
})
