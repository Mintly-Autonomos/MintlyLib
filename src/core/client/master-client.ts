import { PersonClient } from '../../clients'

export class MasterClient {
  personClient: PersonClient
  constructor () {
    this.personClient = new PersonClient()
  }
}

new MasterClient().personClient.insert({ id: '123', name: 'Alice', age: 30 })
