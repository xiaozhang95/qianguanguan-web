import { captcha, login, register } from '@/api/login'
import Icon from '@/components/icon'
import { RoutePath } from '@/router/routes'
import { setToken } from '@/store/token'
import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Divider, Flex, Form, Input, Typography, theme } from 'antd'
import { useCallback, useEffect, useState } from 'react'
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

  const fetchCaptcha = useCallback(() => {
    captcha().then((res) => {
      setCaptchaImage(res.data.captchaImage)
      setCaptchaKey(res.data.captchaKey)
      form.setFieldValue('captchaCode', '')
    })
  }, [form])

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
          <Flex justify="center" className="hide-on-mobile login-logo-wrapper">
            <div className="login-logo">
              <Icon name="logo" size={36} fill={token.colorWhite} />
            </div>
          </Flex>
          <Flex align="center" gap={token.marginSM} className="show-on-mobile login-mobile-brand">
            <div className="login-logo">
              <Icon name="logo" size={36} fill={token.colorWhite} />
            </div>
            <Flex vertical gap={0}>
              <Title level={3} className="login-mobile-name">{import.meta.env.VITE_NAME}</Title>
              <Paragraph className="login-mobile-tagline">让每一笔收支都有迹可循</Paragraph>
            </Flex>
          </Flex>
          <Title level={2} className="hide-on-mobile login-form-title">
            {isRegister ? '创建账号' : '欢迎回来'}
          </Title>
          <Text type="secondary" className="hide-on-mobile login-form-subtitle">
            {isRegister ? '注册后即可开始记账' : '请登录您的账号继续记账'}
          </Text>

          <Form
            size="large"
            form={form}
            initialValues={isRegister ? undefined : {
              username: import.meta.env.VITE_USERNAME,
              password: import.meta.env.VITE_PASSWORD
            }}
            onFinish={(values: { username: string; password: string; confirmPassword?: string; captchaCode: string }) => {
              setLoading(true)
              if (isRegister) {
                register({
                  username: values.username,
                  password: values.password,
                  captchaKey,
                  captchaCode: values.captchaCode
                })
                .then(({ msg }) => {
                  message.success(msg)
                  setIsRegister(false)
                    form.setFieldsValue({ username: values.username, password: '', captchaCode: '' })
                    fetchCaptcha()
                  })
                  .catch(() => fetchCaptcha())
                  .finally(() => setLoading(false))
                return
              }
              login({
                username: values.username,
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
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
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
                <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
              </Form.Item>
            )}
            <Form.Item>
              <Flex gap={token.marginXS}>
                <Form.Item noStyle name="captchaCode" rules={[{ required: true, message: '请输入验证码' }]}>
                  <Input prefix={<SafetyOutlined />} placeholder="验证码" className="login-captcha-input" />
                </Form.Item>
                {captchaImage && (
                  <img
                    alt="验证码"
                    src={captchaImage}
                    onClick={fetchCaptcha}
                    className="login-captcha-img"
                  />
                )}
              </Flex>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                {isRegister ? '注册' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary" className="login-switch-hint">
              {isRegister
                ? <>已有账号？<Button type="link" size="small" onClick={() => { setIsRegister(false); form.resetFields() }}>去登录</Button></>
                : <>没有账号？<Button type="link" size="small" onClick={() => { setIsRegister(true); form.resetFields() }}>去注册</Button></>
              }
            </Text>
          </Divider>
        </Flex>
      </Flex>
    </Flex>
  )
}
