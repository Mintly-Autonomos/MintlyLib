import { Field, ValidationResult } from '../interfaces/field'
import { ORM } from '../types'

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class NumberField<IsOptional extends boolean = false> implements Field {
  constructor (private readonly orm: ORM) {}
  private readonly schema: Record<string, any> = {}

  public required: boolean = true
  getSchema () {
    if (this.orm === ORM.MONGO) {
      return { type: Number, required: true, ...this.schema }
    }
    throw new Error('not supported ORM')
  }

  optional (): NumberField<true> {
    this.schema.required = false
    return this as unknown as NumberField<true>
  }

  validate (value: any): ValidationResult {
    const required = this.schema.required !== false
    if (value === undefined || value === null) {
      if (required) return { value, error: 'Field is required' }
      return { value }
    }
    if (typeof value !== 'number') {
      return { value, error: 'Expected number' }
    }
    return { value }
  }
}
