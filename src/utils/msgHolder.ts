import type { MessageInstance } from 'antd/es/message/interface'

let msgApi: MessageInstance | null = null

export function setMsgApi(api: MessageInstance) {
  msgApi = api
}

export function getMsgApi(): MessageInstance {
  return msgApi!
}
