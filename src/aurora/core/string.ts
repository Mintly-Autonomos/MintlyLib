import { Field, ValidationResult } from '../interfaces/field'
import { ORM } from '../types'

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class StringField<IsOptional extends boolean = false> implements Field {
  constructor (private readonly orm: ORM) {}
  private readonly schema: Record<string, any> = {}
  private readonly validation: Record<string, Function> = {}

  getSchema () {
    if (this.orm === ORM.MONGO) {
      return { type: String, required: true, ...this.schema }
    }
    throw new Error('not supported ORM')
  }

  optional (): StringField<true> {
    this.schema.required = false
    return this as unknown as StringField<true>
  }

  validate (value: any): ValidationResult {
    const required = this.schema.required !== false

    Object.keys(this.validation).forEach((key) => {
      const validator = this.validation[key]
      if (typeof validator === 'function') {
        validator(this.validation[key])
      }
    })

    if (value === undefined || value === null) {
      if (required) return { value, error: 'Field is required' }
      return { value }
    }
    if (typeof value !== 'string') {
      return { value, error: 'Expected string' }
    }
    return { value }
  }

  min (number: number) {
    this.validation.min = (number: number) => {
      if (typeof number !== 'number' || number < 0) {
        throw new Error('min must be a positive number')
      }
    }
    this.schema.min = { value: number }
    return this as unknown as StringField<any>
  }
}
