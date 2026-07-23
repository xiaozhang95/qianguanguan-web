import { userPassword } from '@/api/user'
import { App, Form, Input, Modal } from 'antd'
import './index.scss'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PasswordModal({ open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      userPassword({ oldPassword: values.oldPassword, newPassword: values.newPassword }).then(({ msg }) => {
        message.success(msg)
        form.resetFields()
        onClose()
        onSuccess()
      })
    })
  }

  return (
    <Modal title="修改密码" open={open} onCancel={handleCancel} onOk={handleOk} destroyOnHidden>
      <Form form={form} layout="vertical" className="password-form" autoComplete="off">
        <Form.Item name="oldPassword" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              }
            })
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  )
}
