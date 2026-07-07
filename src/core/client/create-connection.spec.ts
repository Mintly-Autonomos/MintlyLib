import { createHttpConnection } from './create-connection'
import { ApiError } from './api-error'

describe('createHttpConnection', () => {
  const OLD = process.env.BACK_END_URL

  afterEach(() => {
    if (OLD === undefined) delete process.env.BACK_END_URL
    else process.env.BACK_END_URL = OLD
    delete process.env.HTTP_TIMEOUT_MS
  })

  it('lança quando BACK_END_URL não está configurada (M23)', () => {
    delete process.env.BACK_END_URL
    expect(() => createHttpConnection('auth')).toThrow(/BACK_END_URL/)
  })

  it('monta baseURL, timeout default e Content-Type (M22)', () => {
    process.env.BACK_END_URL = 'http://api.test'
    const conn = createHttpConnection('financial-accounts')
    expect(conn.defaults.baseURL).toBe('http://api.test/financial-accounts')
    expect(conn.defaults.timeout).toBe(15000)
  })

  it('respeita HTTP_TIMEOUT_MS quando definido', () => {
    process.env.BACK_END_URL = 'http://api.test'
    process.env.HTTP_TIMEOUT_MS = '3000'
    expect(createHttpConnection('auth').defaults.timeout).toBe(3000)
  })

  describe('interceptor de resposta (M25)', () => {
    const rejectedHandler = () => {
      process.env.BACK_END_URL = 'http://api.test'
      const conn = createHttpConnection('auth')
      return (conn.interceptors.response as any).handlers[0].rejected
    }

    it('transforma erro com envelope { code, message } em ApiError', async () => {
      const rejected = rejectedHandler()
      await expect(
        rejected({ response: { status: 409, data: { code: 'AUTH-0002', message: 'duplicado' } } }),
      ).rejects.toMatchObject({ code: 'AUTH-0002', status: 409, message: 'duplicado' })
      await expect(
        rejected({ response: { status: 409, data: { code: 'AUTH-0002', message: 'duplicado' } } }),
      ).rejects.toBeInstanceOf(ApiError)
    })

    it('repassa o erro cru quando não há envelope da API (ex.: timeout/rede)', async () => {
      const rejected = rejectedHandler()
      const raw = new Error('timeout of 15000ms exceeded')
      await expect(rejected(raw)).rejects.toBe(raw)
    })
  })
})
