import { useEffect, useState } from 'react'

import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { App, Button, Flex, Form, Input, InputNumber, Modal, Popconfirm, Radio, Space, Table, Tag, Upload, theme } from 'antd'

import { type Category, type CategorySaveParams, categoryDelete, categoryList, categorySave, categoryUpdate } from '@/api/category'
import { upload } from '@/api/user'
import { BillType, BillTypeLabel } from '@/constants'

import './index.scss'

export default function CategoryPage() {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState('')
  const [form] = Form.useForm()
  const iconValue: string = Form.useWatch('icon', form) || ''

  const fetchList = () => {
    setLoading(true)
    categoryList()
      .then(({ data }) => setCategories(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const isImageUrl = (icon: string) => icon.startsWith('/upload/') || icon.startsWith('http')

  const columns = [
    {
      title: '图标',
      dataIndex: 'icon',
      width: 80,
      align: 'center' as const,
      render: (icon: string) =>
        isImageUrl(icon) ? (
          <Flex align="center" justify="center">
            <img src={icon} width={16} height={16} className="category-icon-img" />
          </Flex>
        ) : (
          <span>{icon}</span>
        )
    },
    { title: '名称', dataIndex: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => (
        <Tag variant="solid" color={type === BillType.INCOME ? token.colorSuccess : token.colorError}>
          {BillTypeLabel[type as BillType]}
        </Tag>
      )
    },
    {
      title: '标签',
      dataIndex: 'userId',
      width: 80,
      render: (userId: string | null) => (
        <Tag variant="solid" color={userId === null ? token.colorPrimary : token.colorTextQuaternary}>
          {userId === null ? '默认' : '自定义'}
        </Tag>
      )
    },
    { title: '排序', dataIndex: 'sort', width: 80, align: 'center' as const },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: Category) => {
        const isSystem = record.userId === null
        return (
          <Space>
            <Button
              type="link"
              size="small"
              disabled={isSystem}
              onClick={() => {
                setEditingCategory(record)
                form.setFieldsValue(record)
                setIconFile(null)
                setIconPreview(isImageUrl(record.icon) ? record.icon : '')
                setModalOpen(true)
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除？"
              onConfirm={() => {
                categoryDelete(record.id).then(({ msg }) => {
                  message.success(msg)
                  fetchList()
                })
              }}
            >
              <Button type="link" size="small" danger disabled={isSystem}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  return (
    <Flex vertical gap={token.margin}>
      <Flex>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null)
            form.resetFields()
            setIconFile(null)
            setIconPreview('')
            form.setFieldsValue({ type: BillType.EXPENSE, sort: 0 })
            setModalOpen(true)
          }}
        >
          新增分类
        </Button>
      </Flex>
      <Table rowKey="id" columns={columns} dataSource={categories} loading={loading} pagination={false} scroll={{ x: 'max-content' }} />
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={() => {
          form.validateFields().then((values: CategorySaveParams) => {
            const iconPromise = iconFile ? upload(iconFile).then(({ data }) => data.url) : Promise.resolve(values.icon)
            iconPromise.then((icon) => {
              const params = { ...values, icon }
              const action = editingCategory ? categoryUpdate(editingCategory.id, params) : categorySave(params)
              action.then(({ msg }) => {
                message.success(msg)
                setModalOpen(false)
                fetchList()
              })
            })
          })
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical" className="category-form">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：餐饮" />
          </Form.Item>
          <Form.Item name="icon" label="图标" rules={[{ required: true, message: '请输入图标或上传图片' }]}>
            {iconPreview ? (
              <Flex vertical align="flex-start" gap={token.marginXS}>
                <img src={iconPreview} width={64} height={64} className="category-icon-img" />
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    setIconFile(null)
                    setIconPreview('')
                    form.setFieldValue('icon', '')
                  }}
                >
                  移除图片
                </Button>
              </Flex>
            ) : (
              <Flex gap={token.marginXS} align="center">
                <Input placeholder="如：🍜" maxLength={200} className="category-icon-input" />
                {!iconValue && (
                  <Upload
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setIconFile(file)
                      setIconPreview(URL.createObjectURL(file))
                      form.setFieldValue('icon', '[图片]')
                      return false
                    }}
                  >
                    <Button icon={<UploadOutlined />}>上传</Button>
                  </Upload>
                )}
              </Flex>
            )}
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Radio.Group>
              <Radio value={BillType.EXPENSE}>{BillTypeLabel[BillType.EXPENSE]}</Radio>
              <Radio value={BillType.INCOME}>{BillTypeLabel[BillType.INCOME]}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} className="category-input-full" />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}
