import { ReportClient } from './report-client'

describe('ReportClient', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })

  it('cashFlow faz GET /cash-flow com o horizonte na query e devolve o envelope', async () => {
    const client = new ReportClient()
    const get = jest.spyOn((client as any).http.connection, 'get')
      .mockResolvedValue({ data: { payload: { horizon: 60 } } } as any)

    const res = await client.cashFlow({ horizon: 60 }, { env: 'staging', authorization: 'Bearer t' } as any)

    expect(get).toHaveBeenCalledWith('/cash-flow', expect.objectContaining({ params: { horizon: 60 } }))
    expect(res.payload).toEqual({ horizon: 60 })
  })

  it('result faz GET /result com o mês na query e devolve o envelope', async () => {
    const client = new ReportClient()
    const get = jest.spyOn((client as any).http.connection, 'get')
      .mockResolvedValue({ data: { payload: { referenceMonth: '2026-07' } } } as any)

    const res = await client.result({ month: '2026-07' }, { env: 'staging', authorization: 'Bearer t' } as any)

    expect(get).toHaveBeenCalledWith('/result', expect.objectContaining({ params: { month: '2026-07' } }))
    expect(res.payload).toEqual({ referenceMonth: '2026-07' })
  })
})
