import { HttpBaseClient } from '../core/client/http-base-client'
import type { Restaurant } from '../core/data/restaurant/restaurant-entity'

export class RestaurantClient extends HttpBaseClient<Restaurant> {
  constructor () {
    super('restaurants')
  }
}
