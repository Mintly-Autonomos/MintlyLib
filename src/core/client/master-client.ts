import {
  AuthClient,
  PersonClient,
  RestaurantClient,
  FinancialAccountClient,
  FinancialCategoryClient,
  FinancialMovementClient,
  MenuItemClient,
  ReportClient,
  DashboardClient,
} from '../../clients'

export class MasterClient {
  authClient: AuthClient
  personClient: PersonClient
  restaurantClient: RestaurantClient
  financialAccountClient: FinancialAccountClient
  financialCategoryClient: FinancialCategoryClient
  financialMovementClient: FinancialMovementClient
  menuItemClient: MenuItemClient
  reportClient: ReportClient
  dashboardClient: DashboardClient

  constructor () {
    this.authClient = new AuthClient()
    this.personClient = new PersonClient()
    this.restaurantClient = new RestaurantClient()
    this.financialAccountClient = new FinancialAccountClient()
    this.financialCategoryClient = new FinancialCategoryClient()
    this.financialMovementClient = new FinancialMovementClient()
    this.menuItemClient = new MenuItemClient()
    this.reportClient = new ReportClient()
    this.dashboardClient = new DashboardClient()
  }
}
