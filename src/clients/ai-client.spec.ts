import { AiClient } from './ai-client'
import { MasterClient } from '../core/client/master-client'

describe('AiClient', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })
  const headers = { env: 'staging', authorization: 'Bearer t' } as any

  it('usage faz GET /usage', async () => {
    const client = new AiClient()
    const get = jest.spyOn((client as any).http.connection, 'get').mockResolvedValue({ data: { payload: {} } } as any)

    await client.usage(headers)

    expect(get).toHaveBeenCalledWith('/usage', expect.anything())
  })

  it('insights faz POST /insights com a tela e o mês', async () => {
    const client = new AiClient()
    const post = jest.spyOn((client as any).http.connection, 'post').mockResolvedValue({ data: { payload: {} } } as any)

    await client.insights({ page: 'overview', month: '2026-10' }, headers)

    expect(post).toHaveBeenCalledWith('/insights', { page: 'overview', month: '2026-10' }, expect.anything())
  })

  it('priceSuggestion faz POST /price-suggestion (com ou sem prato)', async () => {
    const client = new AiClient()
    const post = jest.spyOn((client as any).http.connection, 'post').mockResolvedValue({ data: { payload: {} } } as any)

    await client.priceSuggestion({ menuItemId: 'm1' }, headers)
    await client.priceSuggestion({}, headers)

    expect(post).toHaveBeenNthCalledWith(1, '/price-suggestion', { menuItemId: 'm1' }, expect.anything())
    expect(post).toHaveBeenNthCalledWith(2, '/price-suggestion', {}, expect.anything())
  })

  it('o MasterClient expõe o aiClient', () => {
    expect(new MasterClient().aiClient).toBeInstanceOf(AiClient)
  })
})
