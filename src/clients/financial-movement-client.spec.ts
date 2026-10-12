import { FinancialMovementClient } from './financial-movement-client'
import { MovementStatus } from '../core/data/financial/financial-movement-schema'

describe('FinancialMovementClient.changeStatus', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })

  const headers = { env: 'staging', authorization: 'Bearer t' } as any

  it('envia só o status quando settledAt não é informado', async () => {
    const client = new FinancialMovementClient()
    const patch = jest.spyOn((client as any).http.connection, 'patch').mockResolvedValue({ data: { payload: {} } } as any)

    await client.changeStatus('m1', MovementStatus.Settled, headers)

    expect(patch).toHaveBeenCalledWith('/m1/status', { status: MovementStatus.Settled }, expect.anything())
  })

  it('envia settledAt junto quando informado', async () => {
    const client = new FinancialMovementClient()
    const patch = jest.spyOn((client as any).http.connection, 'patch').mockResolvedValue({ data: { payload: {} } } as any)

    await client.changeStatus('m1', MovementStatus.Settled, headers, { settledAt: '2026-10-09' })

    expect(patch).toHaveBeenCalledWith(
      '/m1/status',
      { status: MovementStatus.Settled, settledAt: '2026-10-09' },
      expect.anything(),
    )
  })
})
