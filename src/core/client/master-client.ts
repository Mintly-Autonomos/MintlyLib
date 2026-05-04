import { PersonClient } from '../../clients'

export class MasterClient {
  personClient: PersonClient
  constructor () {
    this.personClient = new PersonClient()
  }
}
