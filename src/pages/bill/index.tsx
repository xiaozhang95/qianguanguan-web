import { billDelete, billList, billSave, billStats, billUpdate, type BillSaveParams, type BillVO } from '@/api/bill'
import { categoryList, type Category } from '@/api/category'
import { BillType, BillTypeLabel } from '@/constants'
import { DefaultPagination } from '@/utils/request'
import { PlusOutlined } from '@ant-design/icons'
import { App, Button, Card, DatePicker, Flex, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Statistic, Table, theme } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export default function BillPage() {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const [bills, setBills] = useState<BillVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })

  const [filterType, setFilterType] = useState<string | undefined>()
  const [filterCategoryId, setFilterCategoryId] = useState<string | undefined>()
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs>(dayjs())
  const [pageNum, setPageNum] = useState(DefaultPagination.PageNum as number)
  const [pageSize, setPageSize] = useState(DefaultPagination.PageSize as number)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<BillVO | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  const fetchBills = () => {
    setLoading(true)
    const startDate = filterDate.format('YYYY-MM-DD')
    const endDate = filterDate.format('YYYY-MM-DD')
    billList({ type: filterType, categoryId: filterCategoryId, startDate, endDate, pageNum, pageSize })
      .then(({ data }) => { setBills(data.records); setTotal(data.total) })
      .finally(() => setLoading(false))
  }

  const fetchStats = () => {
    billStats(filterDate.format('YYYY'), filterDate.format('M'), filterDate.format('D')).then(({ data }) => setStats(data))
  }

  useEffect(() => {
    categoryList().then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    fetchBills()
    fetchStats()
  }, [filterDate, filterType, filterCategoryId, pageNum, pageSize])

  const incomeCategories = categories.filter((c) => c.type === BillType.INCOME)
  const expenseCategories = categories.filter((c) => c.type === BillType.EXPENSE)

  const columns = [
    { title: '日期', dataIndex: 'billDate', width: 120, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    {
      title: '分类',
      width: 140,
      render: (_: unknown, record: BillVO) => (
        <span>
          {record.categoryIcon} {record.categoryName}
        </span>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 130,
      render: (amount: number, record: BillVO) => (
        <span style={{ color: record.type === BillType.INCOME ? token.colorSuccess : token.colorError, fontWeight: token.fontWeightStrong }}>
          {record.type === BillType.INCOME ? '+' : '-'}¥{amount.toFixed(2)}
        </span>
      )
    },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: BillVO) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditingBill(record)
              form.setFieldsValue({ ...record, billDate: dayjs(record.billDate) })
              setDrawerOpen(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            disabled={deletingId === record.id}
            onConfirm={() => {
              setDeletingId(record.id)
              billDelete(record.id).then(({ msg }) => {
                message.success(msg)
                setDeletingId(null)
                fetchBills()
                fetchStats()
              })
            }}
          >
            <Button type="link" size="small" danger loading={deletingId === record.id}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
        <Space wrap>
          <DatePicker
            value={filterDate}
            onChange={(v) => {
              if (v) {
                setFilterDate(v)
                setPageNum(DefaultPagination.PageNum as number)
              }
            }}
            allowClear={false}
          />
          <Select
            placeholder="全部类型"
            allowClear
            style={{ width: 100 }}
            value={filterType}
            onChange={(v) => {
              setFilterType(v)
              setPageNum(DefaultPagination.PageNum as number)
            }}
            options={[
              { label: BillTypeLabel[BillType.INCOME], value: BillType.INCOME },
              { label: BillTypeLabel[BillType.EXPENSE], value: BillType.EXPENSE }
            ]}
          />
          <Select
            placeholder="全部分类"
            allowClear
            showSearch
            style={{ width: 140 }}
            value={filterCategoryId}
            onChange={(v) => {
              setFilterCategoryId(v)
              setPageNum(DefaultPagination.PageNum as number)
            }}
            optionFilterProp="label"
            options={categories.map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id }))}
          />
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBill(null)
            form.resetFields()
            form.setFieldsValue({ type: BillType.EXPENSE, billDate: dayjs() })
            setDrawerOpen(true)
          }}
        >
          记一笔
        </Button>
      </Flex>

      <Flex gap={token.marginLG} wrap>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Statistic
            title={<span style={{ fontSize: token.fontSizeLG, fontWeight: token.fontWeightStrong }}>收入</span>}
            value={stats.totalIncome}
            prefix="¥"
            precision={2}
            styles={{ value: { color: token.colorSuccess, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading2 } }}
          />
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Statistic
            title={<span style={{ fontSize: token.fontSizeLG, fontWeight: token.fontWeightStrong }}>支出</span>}
            value={stats.totalExpense}
            prefix="¥"
            precision={2}
            styles={{ value: { color: token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading2 } }}
          />
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <Statistic
            title={<span style={{ fontSize: token.fontSizeLG, fontWeight: token.fontWeightStrong }}>结余</span>}
            value={stats.balance}
            prefix="¥"
            precision={2}
            styles={{ value: { color: stats.balance >= 0 ? token.colorSuccess : token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading2 } }}
          />
        </Card>
      </Flex>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={bills}
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, s) => {
            setPageNum(p)
            setPageSize(s)
          }
        }}
      />

      <Modal
        title={editingBill ? '编辑账单' : '记一笔'}
        open={drawerOpen}
        onCancel={() => setDrawerOpen(false)}
        footer={
          <Flex justify="flex-end" gap={token.marginSM}>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button
              type="primary"
              onClick={() => {
                form.validateFields().then((values: { type: string; categoryId: string; amount: number; billDate: dayjs.Dayjs; remark?: string }) => {
                  const params: BillSaveParams = { ...values, billDate: values.billDate.format('YYYY-MM-DD') }
                  ;(editingBill ? billUpdate(editingBill.id, params) : billSave(params)).then(({ msg }) => {
                    message.success(msg)
                    setDrawerOpen(false)
                    fetchBills()
                fetchStats()
                  })
                })
              }}
            >
              保存
            </Button>
          </Flex>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: BillTypeLabel[BillType.INCOME], value: BillType.INCOME },
                { label: BillTypeLabel[BillType.EXPENSE], value: BillType.EXPENSE }
              ]}
              onChange={() => form.setFieldValue('categoryId', undefined)}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type')
              const options = (type === BillType.INCOME ? incomeCategories : expenseCategories).map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id }))
              return (
                <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                  <Select placeholder="选择分类" options={options} />
                </Form.Item>
              )
            }}
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber min={0.01} precision={2} prefix="¥" style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="billDate" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="选填" rows={2} maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}
