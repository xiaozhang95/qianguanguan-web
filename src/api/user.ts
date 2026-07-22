import create from '@/utils/request'
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
    method: 'GET'
  })
}

export async function userList(data: UserListParams) {
  return create<UserPage>({
    url: '/user/list',
    method: 'POST',
    data
  })
}

export async function userToggle(id: string) {
  return create({
    url: `/user/toggle/${id}`,
    method: 'PUT'
  })
}

export async function userUpdateRole(id: string, role: string) {
  return create({
    url: `/user/role/update/${id}?role=${encodeURIComponent(role)}`,
    method: 'PUT'
  })
}

export async function userProfile(data: { name: string; phone: string; email: string; avatar?: string }) {
  return create<UserInfo>({
    url: '/user/profile',
    method: 'PUT',
    data
  })
}

export async function userPassword(data: { oldPassword: string; newPassword: string }) {
  return create({
    url: '/user/password',
    method: 'PUT',
    data
  })
}

export async function upload(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return create<{ url: string }>({
    url: '/upload',
    method: 'POST',
    data: formData,
    requestType: 'blob'
  })
}
