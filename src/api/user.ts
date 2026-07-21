import create from '@/utils/request'
import type { CtmResponse } from '@/utils/request'
import type { UserInfo } from './login'

export type { UserInfo }

export interface UserListParams {
  username?: string
  role?: string
  status?: number
  pageNum?: number
  pageSize?: number
}

export interface UserPage {
  records: (UserInfo & { status: number })[]
  total: number
  size: number
  current: number
}

export async function userInfo() {
  return create<UserInfo>({
    url: '/user/info',
    method: 'GET',
    errorMsg: true
  })
}

export async function userList(data: UserListParams) {
  return create<UserPage>({
    url: '/user/list',
    method: 'POST',
    data,
    errorMsg: true
  })
}

export async function userToggle(id: number) {
  return create<CtmResponse<null>>({
    url: `/user/toggle/${id}`,
    method: 'PUT',
    errorMsg: true
  })
}
