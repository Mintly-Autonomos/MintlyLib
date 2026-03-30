import { HttpBaseClient } from '../core/client/http-base-client'

export class PersonClient extends HttpBaseClient<{ id: string; name: string; age: number }> {
  constructor () {
    super('person')
  }
}
