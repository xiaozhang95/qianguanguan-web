import create from '@/utils/request'

export interface RegisterParams {
  username: string
  password: string
  captchaKey: string
  captchaCode: string
}

export interface UserInfo {
  id: string
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

export interface QrSceneResult {
  sceneId: string
  qrImage: string
}

export interface QrStatusResult {
  status: string
  token?: string
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

export async function register(params: RegisterParams) {
  return create({
    url: '/register',
    method: 'POST',
    data: params
  })
}

export async function getQrScene() {
  return create<QrSceneResult>({
    url: '/qr-login/scene',
    method: 'GET'
  })
}

export async function checkQrStatus(sceneId: string) {
  return create<QrStatusResult>({
    url: '/qr-login/status',
    method: 'GET',
    params: { sceneId }
  })
}
