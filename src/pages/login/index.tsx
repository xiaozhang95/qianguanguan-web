import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Form, Input } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { captcha as captchaApi, login } from '../../api/login'
import { RoutePath } from '../../router/routes'
import { useAppDispatch } from '../../store'
import { setToken } from '../../store/token'
import { set as setUserInfo } from '../../store/userInfo'

export default function Page() {
  const [form] = Form.useForm()
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const dispatch = useAppDispatch()
  const { message } = App.useApp()

  const fetchCaptcha = useCallback(() => {
    captchaApi().then((res) => {
      setCaptchaImage(res.data.captchaImage)
      setCaptchaKey(res.data.captchaKey)
      form.setFieldValue('captchaCode', '')
    })
  }, [form])

  useEffect(() => {
    fetchCaptcha()
  }, [fetchCaptcha])

  const handleLogin = (values: { username: string; password: string; captchaCode: string }) => {
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
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ width: 400, padding: '40px 32px 24px', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32, color: '#1890ff' }}>钱罐罐</h2>
        <Form form={form} onFinish={handleLogin} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Form.Item noStyle name="captchaCode" rules={[{ required: true, message: '请输入验证码' }]}>
                <Input prefix={<SafetyOutlined />} placeholder="验证码" style={{ flex: 1 }} />
              </Form.Item>
              <img src={captchaImage} alt="验证码" onClick={fetchCaptcha} style={{ height: 40, width: 120, cursor: 'pointer', border: '1px solid #d9d9d9', borderRadius: 6 }} />
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
