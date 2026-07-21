import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Flex, Form, Input, theme } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { captcha, login } from '../../api/login'
import Icon from '../../components/icon'
import { RoutePath } from '../../router/routes'
import { useAppDispatch } from '../../store'
import { setToken } from '../../store/token'
import { setUserInfo } from '../../store/userInfo'

export default function Page() {
  const { token } = theme.useToken()
  const nav = useNavigate()
  const dispatch = useAppDispatch()
  const { message } = App.useApp()

  const [loading, setLoading] = useState(false)
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
    fetchCaptcha()
  }, [fetchCaptcha])

  return (
    <Flex
      vertical
      justify="center"
      align="center"
      style={{
        minHeight: '100vh',
        background: token.colorPrimaryBg,
        padding: token.padding
      }}
    >
      <Flex
        vertical
        align="center"
        style={{
          width: 400,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary
        }}
      >
        <Icon name="logo" style={{ width: 72, height: 72, margin: token.marginSM, color: token.colorPrimary }} />
        <span style={{ marginBottom: token.marginXL, fontSize: token.fontSizeHeading3, fontWeight: 600, color: token.colorText }}>{import.meta.env.VITE_NAME}</span>
        <Form
          size="large"
          form={form}
          initialValues={{
            username: import.meta.env.VITE_USERNAME,
            password: import.meta.env.VITE_PASSWORD
          }}
          onFinish={(values: { username: string; password: string; captchaCode: string }) => {
            setLoading(true)
            login({
              username: values.username,
              password: values.password,
              captchaKey,
              captchaCode: values.captchaCode
            })
              .then(({ data, msg }) => {
                message.success(msg)
                dispatch(setToken(data.token))
                dispatch(setUserInfo(data.userInfo))
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
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Flex gap={token.marginSM}>
              <Form.Item noStyle name="captchaCode" rules={[{ required: true, message: '请输入验证码' }]}>
                <Input prefix={<SafetyOutlined />} placeholder="验证码" style={{ flex: 1 }} />
              </Form.Item>
              <img
                alt="验证码"
                src={captchaImage}
                onClick={fetchCaptcha}
                style={{
                  height: token.controlHeightLG,
                  width: 120,
                  cursor: 'pointer',
                  borderRadius: token.borderRadius,
                  border: `1px solid ${token.colorBorder}`
                }}
              />
            </Flex>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </Flex>
  )
}
