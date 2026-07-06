import {
  AuthClient,
  PersonClient,
  RestaurantClient,
  FinancialAccountClient,
  FinancialCategoryClient,
  FinancialMovementClient,
} from '../../clients'

export class MasterClient {
  authClient: AuthClient
  personClient: PersonClient
  restaurantClient: RestaurantClient
  financialAccountClient: FinancialAccountClient
  financialCategoryClient: FinancialCategoryClient
  financialMovementClient: FinancialMovementClient

  constructor () {
    this.authClient = new AuthClient()
    this.personClient = new PersonClient()
    this.restaurantClient = new RestaurantClient()
    this.financialAccountClient = new FinancialAccountClient()
    this.financialCategoryClient = new FinancialCategoryClient()
    this.financialMovementClient = new FinancialMovementClient()
  }
}
