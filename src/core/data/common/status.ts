export const RECORD_STATUSES = ['active', 'inactive'] as const

export type RecordStatus = typeof RECORD_STATUSES[number]
