import type { UserInfo } from '@/api/login'
import { userProfile, upload } from '@/api/user'
import { PlusOutlined } from '@ant-design/icons'
import { Form, Input, message, Modal, Upload } from 'antd'
import { useEffect, useState } from 'react'

interface Props {
  open: boolean
  userInfo: UserInfo | null
  onClose: () => void
  onSuccess: (userInfo: UserInfo) => void
}

export default function ProfileModal({ open, userInfo, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    if (open && userInfo) {
      form.setFieldsValue({ name: userInfo.name, phone: userInfo.phone, email: userInfo.email })
      setAvatarFile(null)
      setAvatarPreview(userInfo.avatar || '')
    }
  }, [open, userInfo, form])

  return (
    <Modal
      title="修改个人信息"
      open={open}
      onCancel={onClose}
      onOk={() => {
        form.validateFields().then((values) => {
          const avatarPromise = avatarFile ? upload(avatarFile) : Promise.resolve({ data: { url: userInfo?.avatar || '' } })
          avatarPromise.then(({ data: avatarData }) => {
            userProfile({ ...values, avatar: avatarData.url }).then(({ data, msg }) => {
              message.success(msg)
              onSuccess(data)
              onClose()
            })
          })
        })
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="头像" style={{ textAlign: 'center' }}>
          <Upload
            listType="picture-circle"
            maxCount={1}
            showUploadList={{ showPreviewIcon: true }}
            beforeUpload={(file) => { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); return false }}
            onRemove={() => { setAvatarFile(null); setAvatarPreview(userInfo?.avatar || '') }}
          >
            {avatarPreview ? <img src={avatarPreview} alt="" style={{ width: '100%', borderRadius: '50%' }} /> : <PlusOutlined />}
          </Upload>
        </Form.Item>
        <Form.Item name="name" label="姓名">
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="手机号" rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}
