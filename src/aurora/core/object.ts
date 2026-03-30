import { Field, ValidationResult } from '../interfaces/field'
import { InferSchema, ORM } from '../types'

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ObjectField<T extends Record<string, Field>, IsOptional extends boolean = false> implements Field {
  constructor (
    // @ts-ignore
    private readonly orm: ORM,
    readonly obj: T,
  ) {}

  private readonly schema: Record<string, any> = {}

  getSchema () {
    for (const [key, value] of Object.entries(this.obj)) {
      this.schema[key] = typeof value.getSchema === 'function' ? value.getSchema() : value
    }
    return { type: 'object', required: true, properties: this.schema }
  }

  getType (): InferSchema<T> {
    return null as any
  }

  optional (): ObjectField<T, true> {
    this.schema.required = false
    return this as unknown as ObjectField<T, true>
  }

  validate (value: any): ValidationResult {
    const required = true
    if (value === undefined || value === null) {
      if (required) return { value, error: 'Field is required' }
      return { value }
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      return { value, error: 'Expected object' }
    }
    const errors: Record<string, string> = {}
    const validated: Record<string, any> = {}
    // Valida cada campo no objeto e coleta erros (É um capricho, mas é necessário para garantir que todos os campos internos sejam validados, talvez tenha maneiras melhores de fazer isso)
    for (const [key, field] of Object.entries(this.obj)) {
      const result = field.validate(value[key])
      validated[key] = result.value
      if (result.error) errors[key] = result.error
    }
    if (Object.keys(errors).length > 0) {
      return { value: validated, error: JSON.stringify(errors) }
    }
    return { value: validated }
  }
}
