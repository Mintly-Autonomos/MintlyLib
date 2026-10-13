import { FinancialCategoryClient } from './financial-category-client'

describe('FinancialCategoryClient — subcategorias', () => {
  beforeAll(() => { process.env.BACK_END_URL = 'http://api.test' })
  const headers = { env: 'staging', authorization: 'Bearer t' } as any
  const spy = (client: any, method: 'post' | 'patch') => jest.spyOn(client.http.connection, method).mockResolvedValue({ data: { payload: {} } } as any)

  it('addSubcategory → POST /:id/subcategories', async () => {
    const c = new FinancialCategoryClient()
    const post = spy(c, 'post')
    await c.addSubcategory('c1', { name: 'Frango' }, headers)
    expect(post).toHaveBeenCalledWith('/c1/subcategories', { name: 'Frango' }, expect.anything())
  })

  it('updateSubcategory → PATCH /:id/subcategories/:subId', async () => {
    const c = new FinancialCategoryClient()
    const patch = spy(c, 'patch')
    await c.updateSubcategory('c1', 's1', { name: 'Frango inteiro' }, headers)
    expect(patch).toHaveBeenCalledWith('/c1/subcategories/s1', { name: 'Frango inteiro' }, expect.anything())
  })

  it('inactivate/reactivateSubcategory → PATCH …/inactivate|reactivate', async () => {
    const c = new FinancialCategoryClient()
    const patch = spy(c, 'patch')
    await c.inactivateSubcategory('c1', 's1', headers)
    await c.reactivateSubcategory('c1', 's1', headers)
    expect(patch).toHaveBeenNthCalledWith(1, '/c1/subcategories/s1/inactivate', undefined, expect.anything())
    expect(patch).toHaveBeenNthCalledWith(2, '/c1/subcategories/s1/reactivate', undefined, expect.anything())
  })
})
