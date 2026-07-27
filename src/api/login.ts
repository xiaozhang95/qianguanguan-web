import create from '@/utils/request'

export interface RegisterParams {
  password: string
  email: string
  emailCode: string
  captchaKey: string
  captchaCode: string
}

export interface SendEmailCodeParams {
  email: string
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
  email: string
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
  return create<LoginResult>({
    url: '/register',
    method: 'POST',
    data: params
  })
}

export async function sendEmailCode(params: SendEmailCodeParams) {
  return create({
    url: '/send-email-code',
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
