import type { Person } from '../person/person-entity'

export type UserStatus = 'active' | 'inactive' | 'blocked'
export type UserRole = 'admin' | 'member'

export interface User extends Person {
  status: UserStatus
  role: UserRole
  restaurantId?: string
  lastAccessAt?: string
  createdAt: string
  updatedAt: string
}
