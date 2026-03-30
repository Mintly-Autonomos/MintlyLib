import { ArrayField, BooleanField, DateField, NumberField, ObjectField, StringField, TypeField } from '../core'
import { Field, ValidationResult } from '../interfaces/field'
import { InferSchema, ORM } from '../types'
import { AuroraValidationError } from './validation-error'

// A Aurora só está aqui para validação de objetos e criação de types, não use ela para criar schemas de banco de dados, pois está incompleta

export class Aurora<T extends Record<string, Field> = {}> {
  private readonly schema: { [key: string]: any }

  constructor (
    private readonly orm: ORM,
    private readonly obj?: T,
  ) {
    this.schema = {}
    if (this.obj) {
      for (const [key, value] of Object.entries(this.obj)) {
        if (typeof value.getSchema === 'function') {
          this.schema[key] = value.getSchema()
        } else {
          this.schema[key] = value
        }
      }
    }
  }

  string (): StringField {
    return new StringField(this.orm)
  }

  number (): NumberField {
    return new NumberField(this.orm)
  }

  boolean (): BooleanField {
    return new BooleanField(this.orm)
  }

  date (): DateField {
    return new DateField(this.orm)
  }

  array<Arr extends Array<Field>> (arr: Arr): ArrayField<Arr> {
    return new ArrayField(this.orm, arr)
  }

  object<Obj extends Record<string, Field>> (obj: Obj): ObjectField<Obj> {
    return new ObjectField<Obj>(this.orm, obj)
  }

  type (): TypeField {
    return new TypeField(this.orm)
  }

  getSchema () {
    return this.schema
  }

  getType (): InferSchema<T> {
    return null as any
  }

  validate (obj: any): ValidationResult {
    const errors: Record<string, string> = {}
    const validated: Record<string, any> = {}
    for (const [key, field] of Object.entries(this.obj ?? {})) {
      if (typeof field.validate === 'function') {
        const result = field.validate(obj?.[key])
        validated[key] = result.value
        if (result.error) errors[key] = result.error
      }
    }
    if (Object.keys(errors).length > 0) {
      throw new AuroraValidationError(errors)
    }
    return { value: validated }
  }
}

// const a = new Aurora(ORM.MONGO)
// const userOrm = a.object({
//   name: a.string(),
//   age: a.number().optional(),
//   job: a.object({
//     name: a.string(),
//     salary: a.number(),
//     company: a.object({
//       name: a.string(),
//     }).optional()
//   }),
//   birthDate: a.date().optional(),
//   deathDate: a.type().union([a.date(), a.string()]),
//   isIncomeTaxed: a.boolean().optional(),
//   // TODO: see if this use case is necessary
//   // tags: a.array([a.string(), a.number()]).optional(),
//   employmentHistory: a.array([
//     a.object({
//       name: a.string(),
//       salary: a.number(),
//       company: a.string(),
//     }),
//   ])
// })

// export type UserType = ReturnType<typeof userOrm.getType>

// export const user: UserType = {
//   name: 'ale',
//   job: {
//     name: 'dev',
//     salary: 5000,
//     company: {
//       name: 'company',
//     },
//   },
//   birthDate: new Date(),
//   deathDate: true ? '3000-07-01' : new Date(),
//   isIncomeTaxed: true,
//   employmentHistory: [
//     {
//       name: 'dev',
//       salary: 5000,
//       company: 'company',
//     },
//     {
//       name: 'po',
//       salary: 5000,
//       company: 'company'
//     }
//   ],
//   // tags: ['tag1', 123],
// }

// console.log(userOrm.getSchema())

// // Teste de validação com objeto válido
// try {
//   const result = userOrm.validate(user)
//   console.log('Validação bem-sucedida:', result)
// } catch (e) {
//   console.error('Erro de validação (válido):', e)
// }

// // Teste de validação com array inválido (campo faltando e tipo errado)
// const userInvalido = {
//   ...user,
//   employmentHistory: [
//     {
//       name: 'dev',
//       salary: 'não é número', // tipo errado
//       // company: 'company', // campo faltando
//     },
//   ],
// }

// try {
//   const result = userOrm.validate(userInvalido)
//   console.log('Validação inesperadamente bem-sucedida:', result)
// } catch (e) {
//   console.error('Erro de validação (inválido):', e)
// }

// const b = new Aurora(ORM.MONGO)
// const test = b.object({
//   name: b.string(),
//   age: b.number()
// })

// const c = new Aurora(ORM.MONGO)
// const test2 = c.type().pick(test, ['name', 'age'])

// export type A = ReturnType<typeof test2.getType>

// // ver questão do ObjectId no schema
// // ver formas de metrificar os ganhos da ferramenta
// // ver como é q fica a questão do extended reference
