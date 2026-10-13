import { DashboardClient } from './dashboard-client'

describe('DashboardClient', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })

  it('overview faz GET /overview com o mês na query e devolve o envelope', async () => {
    const client = new DashboardClient()
    const get = jest.spyOn((client as any).http.connection, 'get').mockResolvedValue({ data: { payload: { referenceMonth: '2026-07' } } } as any)

    const res = await client.overview({ month: '2026-07' }, { env: 'staging', authorization: 'Bearer t' } as any)

    expect(get).toHaveBeenCalledWith('/overview', expect.objectContaining({ params: { month: '2026-07' } }))
    expect(res.payload).toEqual({ referenceMonth: '2026-07' })
  })
})
