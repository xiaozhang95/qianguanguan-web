import { message } from 'antd'
import store from '../store'

export type Params = Record<string, string | number | undefined>

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type RequestType = 'json' | 'blob'

export type SuccessFn = (response: Response) => void

export type ErrorFn = (error: Error) => void

export interface RequestOptions {
  api?: string
  baseURL?: string
  params?: Params
  timeout?: number
  headers?: Record<string, string>
  url: string
  method: Method
  data?: unknown
  requestType?: RequestType
  responseType?: RequestType | 'text'
  filename?: string
  errorMsg?: boolean
  downloadFile?: boolean
  abortController?: AbortController
}

export interface CtmResponse<T> {
  code: number
  data: T
  msg: string
}

export interface ResponseFile {
  file: Blob
  filename: string
}

export interface BasePagination {
  pageNum?: number
  pageSize: number
}

export interface TableResponse<T> {
  records: T[]
  total: number
}

export const ResponseCode = {
  Success: 200,
  Fail: 500
} as const

export type ResponseCode = (typeof ResponseCode)[keyof typeof ResponseCode]

export const DefaultPagination = {
  PageSize: 10,
  PageNum: 1
} as const

export type DefaultPagination = (typeof DefaultPagination)[keyof typeof DefaultPagination]

export function download({ file, filename }: ResponseFile) {
  const a = document.createElement('a')
  const url = URL.createObjectURL(file)
  a.href = url
  a.target = '_blank'
  a.download = decodeURI(filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function setParams(params: Params | undefined) {
  let url = ''
  if (!params) return url
  Object.keys(params).forEach((key, index) => {
    const value = params[key]
    if (value !== undefined && (typeof value === 'string' || typeof value === 'number')) {
      url += `${index ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    }
  })
  return url
}

class Request {
  public api: string
  public baseURL: string
  public params: Params | undefined
  public headers: HeadersInit | undefined
  public timeout: number
  public url: string
  public method: Method
  public data: unknown
  public abortController?: AbortController

  constructor(ro: RequestOptions) {
    // 设置默认api
    this.api = ro.api!
    // 设置默认baseURL
    this.baseURL = ro.baseURL!
    // 设置默认params
    this.params = ro.params
    // 设置默认headers
    this.headers = ro.headers
    // 设置默认timeout
    this.timeout = ro.timeout!
    // 设置默认url
    this.url = ro.url
    // 设置默认method
    this.method = ro.method
    // 设置默认data
    this.data = ro.data
    // 设置默认abortController
    this.abortController = ro.abortController
  }

  async create(successFn: SuccessFn, errorFn: ErrorFn) {
    const controll = this.abortController || new AbortController()
    const timer = setTimeout(() => {
      if (!this.timeout) return
      controll.abort()
    }, this.timeout)

    try {
      const response = await fetch(this.api + this.baseURL + this.url + setParams(this.params), {
        method: this.method,
        headers: this.headers as HeadersInit,
        body: this.data as BodyInit,
        signal: controll.signal
      })
      if (response.ok) {
        successFn(response)
      } else {
        errorFn(new Error(response.statusText))
      }
    } catch (e) {
      errorFn(e as Error)
    } finally {
      clearTimeout(timer)
    }
  }
}

export default async function create<T>(requestInfo: RequestOptions): Promise<CtmResponse<T>> {
  //设置默认值
  const ro = Object.assign(
    {
      api: import.meta.env.VITE_REQUEST_API,
      baseURL: import.meta.env.VITE_REQUEST_BASE_URL,
      timeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT),
      headers: {},
      requestType: 'json',
      responseType: 'json',
      errorMsg: true,
      downloadFile: true
    },
    requestInfo
  ) as RequestOptions

  // 如果是json请求，需要转换数据格式，并设置请求头
  if (ro.requestType === 'json') {
    ro.data = JSON.stringify(ro.data)
    ro.headers!['Content-Type'] = 'application/json'
  }

  // 设置token
  ro.headers!['Authorization'] = store.getState().token

  return new Promise((resolve, reject) => {
    new Request(ro).create(
      async (response: Response) => {
        if (ro.responseType === 'json') {
          const json = (await response.json()) as CtmResponse<T>
          if (ResponseCode.Success !== Number(json.code)) {
            // 错误处理
            if (ro.errorMsg) message.error(json.msg)
            reject(json)
          } else {
            // 正常返回
            resolve(json)
          }
        } else {
          const responseFile: ResponseFile = {
            file: await response.blob(),
            filename: (ro.filename || response.headers.get('Content-Disposition')?.split('=')[1])!
          }

          if (ro.downloadFile) download(responseFile)

          resolve({
            code: ResponseCode.Success,
            data: responseFile as T,
            msg: ''
          })
        }
      },
      (e) => {
        const resp = {
          code: ResponseCode.Fail,
          data: null,
          message: e.message
        }
        if (e.name === 'AbortError') resp.message = ro.abortController ? '请求中止' : '请求超时'
        if (ro.errorMsg) message.error(resp.message)
        reject(resp)
      }
    )
  })
}
