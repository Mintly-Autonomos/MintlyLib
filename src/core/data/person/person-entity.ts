import type { Infer } from '@ascendance-hub/sapphire-core'
import { Entity } from '../api/entity'
import { personSchema } from './person-schema'

export type Person = Infer<typeof personSchema> & Entity & { cpf?: string }
