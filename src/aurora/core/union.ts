import { Field, ValidationResult } from '../interfaces/field'
import { ORM } from '../types'

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class UnionField<Fields extends Field[], IsOptional extends boolean = false> implements Field {
  constructor (
    private readonly orm: ORM,
    private readonly fields: Fields,
  ) { }

  private readonly schema: Record<string, any> = {}

  getSchema () {
    if (this.orm === ORM.MONGO) {
      return {
        type: 'mixed',
        required: true,
        properties: this.fields.map(f => typeof f.getSchema === 'function' ? f.getSchema() : f),
        ...this.schema,
      }
    }
    throw new Error('not supported ORM')
  }

  optional (): UnionField<Fields, true> {
    this.schema.required = false
    return this as unknown as UnionField<Fields, true>
  }

  validate (value: any): ValidationResult {
    for (const field of this.fields) {
      const result = field.validate(value)
      if (!result.error) return { value: result.value }
    }
    return { value, error: 'Value does not match any allowed type' }
  }
}
