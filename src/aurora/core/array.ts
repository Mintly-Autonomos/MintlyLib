import { Field, ValidationResult } from '../interfaces/field'
import { InferSchema, ORM } from '../types'

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ArrayField<
  T extends Array<Field>,
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  IsOptional extends boolean = false
> implements Field {
  constructor (
    // @ts-ignore
    private readonly orm: ORM,
    private readonly arr: T,
  ) { }

  private readonly schema: Array<Field> = []
  private required: boolean = true

  getSchema () {
    for (const item of this.arr) {
      if (typeof item.getSchema === 'function') {
        this.schema.push(item.getSchema())
      } else {
        this.schema.push(item)
      }
    }
    return { type: 'array', required: this.required, properties: this.schema }
  }

  getType (): InferSchema<T> {
    return null as any
  }

  optional (): ArrayField<T, true> {
    this.required = false
    return this as unknown as ArrayField<T, true>
  }

  validate (value: any): ValidationResult {
    const required = this.required
    if (value === undefined || value === null) {
      if (required) return { value, error: 'Field is required' }
      return { value }
    }
    if (!Array.isArray(value)) {
      return { value, error: 'Expected array' }
    }
    const errors: Record<number, string> = {}
    const validated: any[] = []
    for (let i = 0; i < this.arr.length; i++) {
      const field = this.arr[i]
      if (!field) continue
      const result =
        typeof field.validate === 'function'
          ? field.validate(value[i])
          : { value: value[i] }
      validated[i] = result.value
      if (result.error) errors[i] = result.error
    }
    if (Object.keys(errors).length > 0) {
      return { value: validated, error: JSON.stringify(errors) }
    }
    return { value: validated }
  }
}
