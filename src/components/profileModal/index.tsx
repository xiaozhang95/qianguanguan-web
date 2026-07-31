import type { UserInfo } from '@/api/login'
import { sendEmailCode } from '@/api/login'
import { upload, userProfile } from '@/api/user'
import { PlusOutlined } from '@ant-design/icons'
import { App, Button, Flex, Form, Input, Modal, Upload } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import './index.scss'

interface Props {
  open: boolean
  userInfo: UserInfo | null
  onClose: () => void
  onSuccess: (userInfo: UserInfo) => void
}

export default function ProfileModal({ open, userInfo, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [sendCodeLoading, setSendCodeLoading] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const originalEmail = useRef('')

  useEffect(() => {
    if (open && userInfo) {
      form.setFieldsValue({ name: userInfo.name, phone: userInfo.phone, email: userInfo.email, emailCode: '' })
      setAvatarFile(null)
      setAvatarPreview(userInfo.avatar || '')
      originalEmail.current = userInfo.email || ''
      setCodeCountdown(0)
    }
  }, [open, userInfo, form])

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
    if (email === originalEmail.current) {
      message.warning('邮箱未变更，无需验证')
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
        message.success('验证码已发送')
        setCodeCountdown(60)
      })
      .catch(() => {})
      .finally(() => setSendCodeLoading(false))
  }, [form, message])

  const emailChanged = () => {
    const currentEmail = form.getFieldValue('email')
    return currentEmail && currentEmail !== originalEmail.current
  }

  return (
    <Modal
      title="修改个人信息"
      open={open}
      onCancel={onClose}
      onOk={() => {
        form.validateFields().then((values) => {
          const avatarPromise = avatarFile ? upload(avatarFile) : Promise.resolve({ data: { url: userInfo?.avatar || '' } })
          avatarPromise.then(({ data: avatarData }) => {
            const payload: { name: string; phone: string; email: string; emailCode?: string; avatar?: string } = {
              name: values.name,
              phone: values.phone,
              email: values.email,
              avatar: avatarData.url
            }
            if (emailChanged() && values.emailCode) {
              payload.emailCode = values.emailCode
            }
            userProfile(payload).then(({ data, msg }) => {
              message.success(msg)
              onSuccess(data)
              onClose()
            })
          })
        })
      }}
    >
      <Form form={form} layout="vertical" className="profile-form">
        <Form.Item label="头像" className="profile-upload-label">
          <Upload
            listType="picture-circle"
            maxCount={1}
            showUploadList={{ showPreviewIcon: true }}
            beforeUpload={(file) => {
              setAvatarFile(file)
              setAvatarPreview(URL.createObjectURL(file))
              return false
            }}
            onRemove={() => {
              setAvatarFile(null)
              setAvatarPreview(userInfo?.avatar || '')
            }}
          >
            {avatarPreview ? (
              <div className="profile-avatar-wrapper">
                <img src={avatarPreview} alt="" className="profile-avatar-img" />
                <div className="profile-avatar-overlay">点击更换头像</div>
              </div>
            ) : (
              <PlusOutlined />
            )}
          </Upload>
        </Form.Item>
        <Form.Item name="name" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ required: !userInfo?.wid, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}>
          <Input placeholder={userInfo?.wid ? '请输入邮箱（选填）' : '请输入邮箱'} />
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {() => {
            const needsVerify = emailChanged()
            if (!needsVerify) return null
            const currentEmail = form.getFieldValue('email')
            const emailValid = currentEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)
            return (
              <Form.Item label="邮箱验证码" required>
                <Flex gap={8}>
                  <Form.Item
                    noStyle
                    name="emailCode"
                    rules={[
                      {
                        required: true,
                        message: '请输入邮箱验证码'
                      }
                    ]}
                  >
                    <Input placeholder="请输入验证码" autoComplete="off" readOnly onFocus={(e) => { e.target.readOnly = false }} className="profile-email-code-input" />
                  </Form.Item>
                  <Button
                    type="primary"
                    ghost
                    loading={sendCodeLoading}
                    disabled={codeCountdown > 0 || !emailValid}
                    onClick={handleSendCode}
                    className="profile-email-code-btn"
                  >
                    {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                  </Button>
                </Flex>
              </Form.Item>
            )
          }}
        </Form.Item>
      </Form>
    </Modal>
  )
}
