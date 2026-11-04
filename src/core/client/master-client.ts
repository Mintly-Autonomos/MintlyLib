import {
  AuthClient,
  PersonClient,
  UserClient,
  RestaurantClient,
  FinancialAccountClient,
  FinancialCategoryClient,
  FinancialMovementClient,
  MenuItemClient,
  ReportClient,
  DashboardClient,
  SubscriptionClient,
} from '../../clients'

export class MasterClient {
  authClient: AuthClient
  personClient: PersonClient
  userClient: UserClient
  restaurantClient: RestaurantClient
  financialAccountClient: FinancialAccountClient
  financialCategoryClient: FinancialCategoryClient
  financialMovementClient: FinancialMovementClient
  menuItemClient: MenuItemClient
  reportClient: ReportClient
  dashboardClient: DashboardClient
  subscriptionClient: SubscriptionClient

  constructor () {
    this.authClient = new AuthClient()
    this.personClient = new PersonClient()
    this.userClient = new UserClient()
    this.restaurantClient = new RestaurantClient()
    this.financialAccountClient = new FinancialAccountClient()
    this.financialCategoryClient = new FinancialCategoryClient()
    this.financialMovementClient = new FinancialMovementClient()
    this.menuItemClient = new MenuItemClient()
    this.reportClient = new ReportClient()
    this.dashboardClient = new DashboardClient()
    this.subscriptionClient = new SubscriptionClient()
  }
}
