import { Field } from '../interfaces/field'
import { ORM } from '../types'
import { ObjectField } from './object'
import { UnionField } from './union'

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class TypeField<IsOptional extends boolean = false> {
  constructor (private readonly orm: ORM) { }

  union<Fields extends Field[]> (fields: Fields): UnionField<Fields, false> {
    return new UnionField(this.orm, fields)
  }

  pick<
    T extends Record<string, any>,
    K extends readonly (keyof T)[]
  >(
    objectField: ObjectField<T, any>,
    keys: K,
  ): ObjectField<Pick<T, K[number]>, false> {
    const pickedObj = Object.fromEntries(
      keys.map((key) => [key, objectField.obj[key]]),
    ) as Pick<T, K[number]>
    return new ObjectField(this.orm, pickedObj)
  }
}
