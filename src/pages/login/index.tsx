import { captcha, checkQrStatus, getQrScene, login, register, sendEmailCode } from '@/api/login'
import logo from '@/assets/images/logo.png'
import { RoutePath } from '@/router/routes'
import { setToken } from '@/store/token'
import { LockOutlined, MailOutlined, SafetyOutlined, WechatOutlined } from '@ant-design/icons'
import { App, Button, Divider, Flex, Form, Input, Spin, Typography, theme } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import './index.scss'

const { Title, Text, Paragraph } = Typography

const features = [
  { icon: '💰', text: '轻松记账，收支一目了然' },
  { icon: '📊', text: '月度统计，消费结构尽收眼底' },
  { icon: '✨', text: '极简设计，记账从未如此简单' }
]

export default function Page() {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const nav = useNavigate()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [form] = Form.useForm()
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')

  const [sendCodeLoading, setSendCodeLoading] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)

  const [qrMode, setQrMode] = useState(false)
  const [qrImage, setQrImage] = useState('')
  const [sceneId, setSceneId] = useState('')
  const [qrStatus, setQrStatus] = useState('')
  const pollingRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const fetchCaptcha = useCallback(() => {
    captcha().then((res) => {
      setCaptchaImage(res.data.captchaImage)
      setCaptchaKey(res.data.captchaKey)
      form.setFieldValue('captchaCode', '')
    })
  }, [form])

  useEffect(() => {
    if (codeCountdown <= 0) return
    const timer = setInterval(() => {
      setCodeCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [codeCountdown])

  const handleSendCode = useCallback(() => {
    const email = form.getFieldValue('email')
    if (!email) {
      message.warning('请先输入邮箱')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      message.warning('请输入正确的邮箱地址')
      return
    }
    setSendCodeLoading(true)
    sendEmailCode({ email })
      .then(() => {
        message.success('验证码已发送，请查收邮件')
        setCodeCountdown(60)
      })
      .catch(() => {})
      .finally(() => setSendCodeLoading(false))
  }, [form, message])

  const startQrLogin = useCallback(() => {
    setQrMode(true)
    setQrStatus('loading')
    getQrScene()
      .then(({ data }) => {
        setQrImage(data.qrImage)
        setSceneId(data.sceneId)
        setQrStatus('pending')
      })
      .catch(() => {
        setQrMode(false)
      })
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = undefined
    }
  }, [])

  useEffect(() => {
    if (qrStatus === 'pending' && sceneId) {
      stopPolling()
      pollingRef.current = setInterval(() => {
        checkQrStatus(sceneId)
          .then(({ data }) => {
            if (data.status === 'confirmed' && data.token) {
              stopPolling()
              dispatch(setToken(data.token))
              nav(RoutePath.Home, { replace: true })
            } else if (data.status === 'expired') {
              stopPolling()
              setQrStatus('expired')
              message.warning('二维码已过期，请刷新')
            }
          })
          .catch(() => {})
      }, 2000)
    }
    return stopPolling
  }, [qrStatus, sceneId, stopPolling, dispatch, nav, message])

  useEffect(() => {
    document.title = `${import.meta.env.VITE_NAME} - ${isRegister ? '注册' : '登录'}`
  }, [isRegister])

  useEffect(() => {
    fetchCaptcha()
  }, [fetchCaptcha])

  return (
    <Flex align="center" className="login-page">
      <div className="login-decor login-decor--tl" />
      <div className="login-decor login-decor--br" />

      <Flex flex={1} vertical align="center" className="hide-on-mobile login-left-panel">
        <Title level={1} className="login-brand-title">
          {import.meta.env.VITE_NAME}
        </Title>
        <Paragraph className="login-brand-subtitle">让每一笔收支都有迹可循</Paragraph>
        <Flex vertical gap={token.marginSM} align="center">
          {features.map((f) => (
            <Flex key={f.text} align="center" gap={token.marginXS}>
              <span className="login-feature-icon">{f.icon}</span>
              <Text className="login-feature-text">{f.text}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Flex align="center" className="hide-on-mobile login-divider-wrapper">
        <div className="login-divider-v" />
      </Flex>

      <Flex vertical align="center" className="login-form-area">
        <Flex vertical className="login-form-card">
          {!qrMode && <Flex justify="center" className="hide-on-mobile login-logo-wrapper">
            <img src={logo} className="login-logo-img" alt="logo" />
          </Flex>}
          {!qrMode && <Flex align="center" gap={token.marginSM} className="show-on-mobile login-mobile-brand">
            <img src={logo} className="login-logo-img" alt="logo" />
            <Flex vertical gap={0}>
              <Title level={3} className="login-mobile-name">
                {import.meta.env.VITE_NAME}
              </Title>
              <Paragraph className="login-mobile-tagline">让每一笔收支都有迹可循</Paragraph>
            </Flex>
          </Flex>}

          {qrMode ? (
            <Flex vertical align="center" className="login-qr-section">
              <Title level={4}>微信扫码登录</Title>
              {qrImage ? (
                <>
                  <img src={qrImage} alt="登录二维码" className="login-qr-img" />
                  {qrStatus === 'pending' && (
                    <Flex align="center" gap={token.marginXS}>
                      <Spin size="small" />
                      <Text type="secondary">请使用微信扫码确认登录</Text>
                    </Flex>
                  )}
                  {qrStatus === 'expired' && (
                    <Button type="link" onClick={startQrLogin}>
                      已过期，点击刷新
                    </Button>
                  )}
                </>
              ) : (
                <Spin size="large" />
              )}
              <Divider style={{ width: '100%' }} />
              <Button
                type="link"
                onClick={() => {
                  setQrMode(false)
                  stopPolling()
                }}
              >
                使用邮箱密码登录
              </Button>
            </Flex>
          ) : (
            <>
              <Title level={2} className="hide-on-mobile login-form-title">
                {isRegister ? '创建账号' : '欢迎回来'}
              </Title>
              <Text type="secondary" className="hide-on-mobile login-form-subtitle">
                {isRegister ? '注册后即可开始记账' : '请登录您的账号继续记账'}
              </Text>

              <Form
                size="large"
                form={form}
                onFinish={(values: { email: string; emailCode: string; password: string; confirmPassword?: string; captchaCode: string }) => {
                  setLoading(true)
                  if (isRegister) {
                    register({
                      email: values.email,
                      emailCode: values.emailCode,
                      password: values.password,
                      captchaKey,
                      captchaCode: values.captchaCode
                    })
                      .then(({ data }) => {
                        dispatch(setToken(data.token))
                        nav(RoutePath.Home, { replace: true })
                      })
                      .catch(() => fetchCaptcha())
                      .finally(() => setLoading(false))
                    return
                  }
                  login({
                    email: values.email,
                    password: values.password,
                    captchaKey,
                    captchaCode: values.captchaCode
                  })
                    .then(({ data }) => {
                      dispatch(setToken(data.token))
                      nav(RoutePath.Home, { replace: true })
                    })
                    .catch(() => {
                      fetchCaptcha()
                    })
                    .finally(() => {
                      setLoading(false)
                    })
                }}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入正确的邮箱地址' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="邮箱" autoComplete="off" />
                </Form.Item>
                {isRegister && (
                  <Form.Item>
                    <Flex gap={token.marginXS}>
                      <Form.Item noStyle name="emailCode" rules={[{ required: true, message: '请输入邮箱验证码' }]}>
                        <Input prefix={<SafetyOutlined />} placeholder="邮箱验证码" className="login-captcha-input" autoComplete="one-time-code" />
                      </Form.Item>
                      <Button type="primary" ghost loading={sendCodeLoading} disabled={codeCountdown > 0} onClick={handleSendCode} className="login-captcha-btn">
                        {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                      </Button>
                    </Flex>
                  </Form.Item>
                )}
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="new-password" />
                </Form.Item>
                {isRegister && (
                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'))
                        }
                      })
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="确认密码" autoComplete="new-password" />
                  </Form.Item>
                )}
                <Form.Item>
                  <Flex gap={token.marginXS}>
                    <Form.Item noStyle name="captchaCode" rules={[{ required: true, message: '请输入验证码' }]}>
                      <Input prefix={<SafetyOutlined />} placeholder="验证码" className="login-captcha-input" />
                    </Form.Item>
                    {captchaImage && <img alt="验证码" src={captchaImage} onClick={fetchCaptcha} className="login-captcha-img" />}
                  </Flex>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block size="large">
                    {isRegister ? '注册' : '登录'}
                  </Button>
                </Form.Item>
              </Form>

              <Flex justify="center" className="login-qr-entry">
                <Button type="link" icon={<WechatOutlined />} onClick={startQrLogin}>
                  微信扫码登录
                </Button>
              </Flex>

              <Divider plain>
                <Text type="secondary" className="login-switch-hint">
                  {isRegister ? (
                    <>
                      已有账号？
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setIsRegister(false)
                          form.resetFields()
                          setCodeCountdown(0)
                        }}
                      >
                        去登录
                      </Button>
                    </>
                  ) : (
                    <>
                      没有账号？
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setIsRegister(true)
                          form.resetFields()
                          setCodeCountdown(0)
                        }}
                      >
                        去注册
                      </Button>
                    </>
                  )}
                </Text>
              </Divider>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
