import { captcha, login } from '@/api/login'
import Icon from '@/components/icon'
import { RoutePath } from '@/router/routes'
import { setToken } from '@/store/token'
import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Divider, Flex, Form, Input, theme, Typography } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

const features = [
  { icon: '💰', text: '轻松记账，收支一目了然' },
  { icon: '📊', text: '月度统计，消费结构尽收眼底' },
  { icon: '✨', text: '极简设计，记账从未如此简单' }
]

export default function Page() {
  const { token } = theme.useToken()
  const nav = useNavigate()
  const dispatch = useDispatch()

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
    <Flex align="center" style={{ minHeight: '100vh', background: token.colorBgContainer, position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: token.colorPrimaryBg
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: token.colorPrimaryBg
        }}
      />

      <Flex flex={1} vertical align="center" style={{ position: 'relative', zIndex: 1, padding: token.paddingXL }}>
        <div style={{
          width: 96, height: 96, borderRadius: 24, marginBottom: token.marginLG,
          background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${token.colorPrimary}40`
        }}>
          <Icon name="logo" style={{ width: 60, height: 60 }} fill="#fff" />
        </div>
        <Title level={1} style={{ color: token.colorText, marginBottom: token.marginSM }}>
          {import.meta.env.VITE_NAME}
        </Title>
        <Paragraph style={{ color: token.colorTextDescription, fontSize: token.fontSizeLG, marginBottom: token.marginXXL }}>让每一笔收支都有迹可循</Paragraph>
        <Flex vertical gap={token.marginMD} align="center">
          {features.map((f) => (
            <Flex key={f.text} align="center" gap={token.marginSM}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <Text style={{ color: token.colorTextSecondary, fontSize: token.fontSize }}>{f.text}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Flex align="center" style={{ height: '60vh' }}>
        <div style={{ width: 1, height: '100%', background: token.colorBorderSecondary }} />
      </Flex>

      <Flex flex={1} vertical align="center" style={{ padding: token.paddingXL, position: 'relative', zIndex: 1 }}>
        <Flex
          vertical
          style={{
            width: 440,
            maxWidth: '100%',
            padding: `${token.paddingXL}px ${token.paddingLG}px`,
            background: token.colorBgElevated,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary
          }}
        >
          <Flex justify="center" style={{ marginBottom: token.marginMD }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: token.colorFillSecondary,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <UserOutlined style={{ fontSize: 28, color: token.colorTextTertiary }} />
            </div>
          </Flex>
          <Title level={2} style={{ color: token.colorText, marginBottom: token.marginXS, textAlign: 'center' }}>
            欢迎回来
          </Title>
          <Text type="secondary" style={{ marginBottom: token.marginXL, textAlign: 'center', display: 'block' }}>
            请登录您的账号继续记账
          </Text>

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
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <Flex gap={token.marginSM}>
                <Form.Item noStyle name="captchaCode" rules={[{ required: true, message: '请输入验证码' }]}>
                  <Input prefix={<SafetyOutlined />} placeholder="验证码" style={{ flex: 1 }} />
                </Form.Item>
                {captchaImage && (
                  <img
                    alt="验证码"
                    src={captchaImage}
                    onClick={fetchCaptcha}
                    style={{
                      height: token.controlHeightLG,
                      width: 130,
                      cursor: 'pointer',
                      borderRadius: token.borderRadius,
                      border: `1px solid ${token.colorBorder}`
                    }}
                  />
                )}
              </Flex>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {import.meta.env.VITE_NAME} · 个人记账助手
            </Text>
          </Divider>
        </Flex>
      </Flex>
    </Flex>
  )
}
