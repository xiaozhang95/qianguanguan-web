export const BillType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
} as const

export type BillType = (typeof BillType)[keyof typeof BillType]

export const BillTypeLabel: Record<BillType, string> = {
  [BillType.INCOME]: '收入',
  [BillType.EXPENSE]: '支出'
}
