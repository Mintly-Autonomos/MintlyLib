import { HttpBaseClient } from '../core/client/http-base-client'
import type { Person } from '../core/data/person/person-entity'

export class PersonClient extends HttpBaseClient<Person> {
  constructor () {
    super('people')
  }
}
