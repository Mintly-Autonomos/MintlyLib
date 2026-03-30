import { Field, ValidationResult } from '../interfaces/field'
import { ORM } from '../types'

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class DateField<IsOptional extends boolean = false> implements Field {
  constructor (private readonly orm: ORM) {}
  private readonly schema: Record<string, any> = {}

  getSchema () {
    if (this.orm === ORM.MONGO) {
      return { type: Date, required: true, ...this.schema }
    }
    throw new Error('not supported ORM')
  }

  optional (): DateField<true> {
    this.schema.required = false
    return this as unknown as DateField<true>
  }

  validate (value: any): ValidationResult {
    const required = this.schema.required !== false
    if (value === undefined || value === null) {
      if (required) return { value, error: 'Field is required' }
      return { value }
    }
    if (!(value instanceof Date) && typeof value !== 'string') {
      return { value, error: 'Expected date or date string' }
    }
    // Essa parte eu valido se a String é uma data válida (Pensando em compatibilidade com outros ORM`s, talvez seja necessário alterar isso no futuro)
    if (typeof value === 'string') {
      const d = new Date(value)
      if (isNaN(d.getTime())) return { value, error: 'Invalid date string' }
      return { value: d }
    }
    return { value }
  }
}
