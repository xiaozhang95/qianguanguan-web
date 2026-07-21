import create from '@/utils/request'
import type { UserInfo } from './login'

export type { UserInfo }

export async function userInfo() {
  return create<UserInfo>({
    url: '/user/info',
    method: 'GET',
    errorMsg: true
  })
}
