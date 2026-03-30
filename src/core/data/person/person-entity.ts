import { Entity } from '../api/entity'
import { personOrm } from './person-orm'

export type Person = ReturnType<typeof personOrm.getType> & Entity
