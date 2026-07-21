import create from '@/utils/request'

export interface UserInfo {
  id: number
  username: string
  name: string
  role: string
  phone: string
  email: string
  avatar: string
  createtime: string
}

export interface LoginParams {
  username: string
  password: string
  captchaKey: string
  captchaCode: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

export interface CaptchaResult {
  captchaKey: string
  captchaImage: string
}

export async function captcha() {
  return create<CaptchaResult>({
    url: '/captcha',
    method: 'GET'
  })
}

export async function login(params: LoginParams) {
  return create<LoginResult>({
    url: '/login',
    method: 'POST',
    data: params
  })
}
