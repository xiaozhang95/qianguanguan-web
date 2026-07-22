import { categoryDelete, categoryList, categorySave, categoryUpdate, type Category, type CategorySaveParams } from '@/api/category'
import { BillType, BillTypeLabel } from '@/constants'
import { PlusOutlined } from '@ant-design/icons'
import { App, Button, Flex, Form, Input, InputNumber, Modal, Popconfirm, Radio, Space, Table, Tag, theme } from 'antd'
import { useEffect, useState } from 'react'

export default function CategoryPage() {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  const fetchList = () => {
    setLoading(true)
    categoryList()
      .then(({ data }) => setCategories(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const columns = [
    { title: '图标', dataIndex: 'icon', width: 80, align: 'center' as const },
    { title: '名称', dataIndex: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === BillType.INCOME ? token.colorSuccess : token.colorError}>
          {BillTypeLabel[type as BillType]}
        </Tag>
      )
    },
    { title: '排序', dataIndex: 'sort', width: 80, align: 'center' as const },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditingCategory(record); form.setFieldsValue(record); setModalOpen(true) }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => { categoryDelete(record.id).then(({ msg }) => { message.success(msg); fetchList() }) }}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCategory(null); form.resetFields(); form.setFieldsValue({ type: BillType.EXPENSE, sort: 0 }); setModalOpen(true) }}>新增分类</Button>
      </Flex>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={() => {
          form.validateFields().then((values: CategorySaveParams) => {
            const action = editingCategory ? categoryUpdate(editingCategory.id, values) : categorySave(values)
            action.then(({ msg }) => { message.success(msg); setModalOpen(false); fetchList() })
          })
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical" style={{ marginTop: token.marginMD }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：餐饮" />
          </Form.Item>
          <Form.Item name="icon" label="图标" rules={[{ required: true, message: '请输入图标' }]}>
            <Input placeholder="如：🍜" maxLength={10} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Radio.Group>
              <Radio value={BillType.INCOME}>{BillTypeLabel[BillType.INCOME]}</Radio>
              <Radio value={BillType.EXPENSE}>{BillTypeLabel[BillType.EXPENSE]}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}
