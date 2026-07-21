import { billDelete, billList, billSave, billStats, billUpdate, type BillSaveParams, type BillVO } from '@/api/bill'
import { categoryList, type Category } from '@/api/category'
import { BillType, BillTypeLabel } from '@/constants'
import { PlusOutlined } from '@ant-design/icons'
import { Button, DatePicker, Drawer, Form, Input, InputNumber, message, Popconfirm, Select, Space, Statistic, Table } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

const { MonthPicker } = DatePicker

export default function BillPage() {
  const [bills, setBills] = useState<BillVO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })

  const [filterType, setFilterType] = useState<string | undefined>()
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>()
  const [filterMonth, setFilterMonth] = useState<dayjs.Dayjs>(dayjs())
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<BillVO | null>(null)
  const [form] = Form.useForm()

  const fetchBills = () => {
    setLoading(true)
    const startDate = filterMonth.startOf('month').format('YYYY-MM-DD')
    const endDate = filterMonth.endOf('month').format('YYYY-MM-DD')
    billList({
      type: filterType,
      categoryId: filterCategoryId,
      startDate,
      endDate,
      pageNum,
      pageSize
    })
      .then(({ data }) => {
        setBills(data.records)
        setTotal(data.total)
      })
      .finally(() => setLoading(false))
  }

  const fetchStats = () => {
    billStats(filterMonth.format('YYYY'), filterMonth.format('M')).then(({ data }) => setStats(data))
  }

  const fetchCategories = () => {
    categoryList().then(({ data }) => setCategories(data))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBills()
    fetchStats()
  }, [filterMonth, filterType, filterCategoryId, pageNum, pageSize])

  const incomeCategories = categories.filter((c) => c.type === BillType.INCOME)
  const expenseCategories = categories.filter((c) => c.type === BillType.EXPENSE)

  const handleAdd = () => {
    setEditingBill(null)
    form.resetFields()
    form.setFieldsValue({ type: BillType.EXPENSE, billDate: dayjs() })
    setDrawerOpen(true)
  }

  const handleEdit = (record: BillVO) => {
    setEditingBill(record)
    form.setFieldsValue({
      ...record,
      billDate: dayjs(record.billDate)
    })
    setDrawerOpen(true)
  }

  const handleDelete = (id: number) => {
    billDelete(id).then(() => {
      message.success('删除成功')
      fetchBills()
      fetchStats()
    })
  }

  const handleSubmit = () => {
    form.validateFields().then((values: { type: string; categoryId: number; amount: number; billDate: dayjs.Dayjs; remark?: string }) => {
      const params: BillSaveParams = {
        ...values,
        billDate: values.billDate.format('YYYY-MM-DD')
      }
      const action = editingBill ? billUpdate(editingBill.id, params) : billSave(params)
      action.then(() => {
        message.success(editingBill ? '更新成功' : '新增成功')
        setDrawerOpen(false)
        fetchBills()
        fetchStats()
      })
    })
  }

  const columns = [
    {
      title: '日期',
      dataIndex: 'billDate',
      width: 120
    },
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
        <span style={{ color: record.type === BillType.INCOME ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
          {record.type === BillType.INCOME ? '+' : '-'}¥{amount.toFixed(2)}
        </span>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: BillVO) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space wrap>
          <MonthPicker
            value={filterMonth}
            onChange={(v) => {
              if (v) {
                setFilterMonth(v)
                setPageNum(1)
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
              setPageNum(1)
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
              setPageNum(1)
            }}
            options={categories.map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id }))}
            filterOption={(input, option) => (option?.label as string)?.includes(input)}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          记一笔
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 24, background: '#fff', padding: '16px 24px', borderRadius: 8 }}>
        <Statistic title="收入" value={stats.totalIncome} prefix="¥" precision={2} valueStyle={{ color: '#52c41a' }} />
        <Statistic title="支出" value={stats.totalExpense} prefix="¥" precision={2} valueStyle={{ color: '#ff4d4f' }} />
        <Statistic title="结余" value={stats.balance} prefix="¥" precision={2} valueStyle={{ color: stats.balance >= 0 ? '#52c41a' : '#ff4d4f' }} />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={bills}
        loading={loading}
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

      <Drawer
        title={editingBill ? '编辑账单' : '记一笔'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
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
      </Drawer>
    </div>
  )
}
