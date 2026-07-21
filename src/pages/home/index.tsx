import { billList, billStats, type BillVO } from '@/api/bill'
import { categoryList, type Category } from '@/api/category'
import { Card, Col, Row, Statistic, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [recentBills, setRecentBills] = useState<BillVO[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const month = dayjs().format('M')

  useEffect(() => {
    const now = dayjs()
    const year = now.format('YYYY')
    const startDate = now.startOf('month').format('YYYY-MM-DD')
    const endDate = now.endOf('month').format('YYYY-MM-DD')

    categoryList().then(({ data }) => setCategories(data))
    setLoading(true)

    Promise.all([billStats(year, month), billList({ startDate, endDate, pageNum: 1, pageSize: 5 })])
      .then(([statsRes, listRes]) => {
        setStats(statsRes.data)
        setRecentBills(listRes.data.records)
      })
      .finally(() => setLoading(false))
  }, [])

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title={`${month}月收入`} value={stats.totalIncome} prefix="¥" precision={2} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title={`${month}月支出`} value={stats.totalExpense} prefix="¥" precision={2} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title={`${month}月结余`} value={stats.balance} prefix="¥" precision={2} valueStyle={{ color: stats.balance >= 0 ? '#52c41a' : '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card title="最近账单">
        <Table
          rowKey="id"
          dataSource={recentBills}
          loading={loading}
          pagination={false}
          columns={[
            { title: '日期', dataIndex: 'billDate', width: 120 },
            {
              title: '分类',
              width: 120,
              render: (_: unknown, r: BillVO) => (
                <span>
                  {categoryMap.get(r.categoryId)?.icon} {categoryMap.get(r.categoryId)?.name || r.categoryName}
                </span>
              )
            },
            {
              title: '金额',
              dataIndex: 'amount',
              width: 130,
              render: (amount: number, r: BillVO) => (
                <span style={{ color: r.type === 'INCOME' ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
                  {r.type === 'INCOME' ? '+' : '-'}¥{amount.toFixed(2)}
                </span>
              )
            },
            {
              title: '类型',
              dataIndex: 'type',
              width: 80,
              render: (type: string) => <Tag color={type === 'INCOME' ? 'green' : 'red'}>{type === 'INCOME' ? '收入' : '支出'}</Tag>
            },
            { title: '备注', dataIndex: 'remark', ellipsis: true }
          ]}
        />
      </Card>
    </div>
  )
}
