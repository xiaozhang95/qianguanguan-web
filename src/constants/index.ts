export const BillType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
} as const

export type BillType = (typeof BillType)[keyof typeof BillType]

export const BillTypeLabel: Record<BillType, string> = {
  [BillType.INCOME]: '收入',
  [BillType.EXPENSE]: '支出'
}

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const RoleLabel: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '超级管理员',
  [Role.ADMIN]: '管理员',
  [Role.USER]: '用户'
}

export const UserStatus = {
  ENABLED: 1,
  DISABLED: 0
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ENABLED]: '启用',
  [UserStatus.DISABLED]: '禁用'
}
