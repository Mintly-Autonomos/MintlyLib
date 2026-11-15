import { FinancialAccountClient } from '../../../clients/financial-account-client'
import { FinancialMovementClient } from '../../../clients/financial-movement-client'
import { financialCategorySchema, SystemCategoryKey } from './financial-category-schema'
import { openingBalanceSchema, transferSchema } from './financial-movement-schema'
import * as financial from './index'

describe('transferência entre contas e saldo inicial (S3.2)', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })
  const headers = { env: 'staging', authorization: 'Bearer t' } as any

  it('transferSchema: aceita o par de contas, valor positivo e data; recusa valor 0 e campo a mais', () => {
    expect(transferSchema.safeParse({ fromAccountId: 'a', toAccountId: 'b', amount: 1500, date: '2026-11-10' }).success).toBe(true)
    expect(transferSchema.safeParse({ fromAccountId: 'a', toAccountId: 'b', amount: 0, date: '2026-11-10' }).success).toBe(false)
    expect(transferSchema.safeParse({ fromAccountId: 'a', toAccountId: 'b', amount: 10, date: '2026-11-10', transferId: 'x' }).success).toBe(false)
  })

  it('openingBalanceSchema: aceita 0 (remove) e recusa negativo', () => {
    expect(openingBalanceSchema.safeParse({ amount: 0, date: '2026-05-01' }).success).toBe(true)
    expect(openingBalanceSchema.safeParse({ amount: 18_500, date: '2026-05-01' }).success).toBe(true)
    expect(openingBalanceSchema.safeParse({ amount: -1, date: '2026-05-01' }).success).toBe(false)
  })

  it('categoria pode ter systemKey (só as do sistema)', () => {
    const base = {
      restaurantId: 'r',
      name: 'Transferência entre contas',
      behavior: 'fixed',
      operationalNature: 'nonOperational',
      status: 'active',
      isSystem: true,
      history: [],
      subcategories: [],
      audit: { createdAt: new Date(), updatedAt: new Date() },
    }
    const ok = financialCategorySchema.safeParse({ ...base, type: 'revenue', systemKey: SystemCategoryKey.TransferIn })
    expect(ok.success).toBe(true)
    expect(financialCategorySchema.safeParse({ ...base, type: 'revenue', systemKey: 'outra' }).success).toBe(false)
  })

  it('exporta os tipos e schemas pelo índice', () => {
    expect(financial.SystemCategoryKey.OpeningBalance).toBe('openingBalance')
    expect(typeof financial.transferSchema.safeParse).toBe('function')
    const req: financial.TransferRequest = { fromAccountId: 'a', toAccountId: 'b', amount: 1, date: '2026-11-10' }
    const ob: financial.OpeningBalanceRequest = { amount: 1, date: '2026-11-10' }
    expect([req.amount, ob.amount]).toEqual([1, 1])
  })

  it('FinancialMovementClient.transfer → POST /transfers com o corpo', async () => {
    const c = new FinancialMovementClient() as any
    const post = jest.spyOn(c.http.connection, 'post').mockResolvedValue({ data: { payload: { transferId: 't1' } } } as any)
    const body = { fromAccountId: 'a', toAccountId: 'b', amount: 500, date: '2026-11-10' }
    const res = await c.transfer(body, headers)
    expect(post).toHaveBeenCalledWith('/transfers', body, expect.anything())
    expect(res.payload.transferId).toBe('t1')
  })

  it('FinancialAccountClient.openingBalance → PUT /:id/opening-balance', async () => {
    const c = new FinancialAccountClient() as any
    const put = jest.spyOn(c.http.connection, 'put').mockResolvedValue({ data: { payload: null } } as any)
    await c.openingBalance('acc1', { amount: 0, date: '2026-05-01' }, headers)
    expect(put).toHaveBeenCalledWith('/acc1/opening-balance', { amount: 0, date: '2026-05-01' }, expect.anything())
  })
})
