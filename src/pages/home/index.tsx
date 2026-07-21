import { billList, billStats, type BillVO } from '@/api/bill'
import { categoryList, type Category } from '@/api/category'
import { BillType, BillTypeLabel } from '@/constants'
import { DefaultPagination } from '@/utils/request'
import { Card, Flex, Statistic, Table, Tag, theme } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { token } = theme.useToken()
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

    Promise.all([billStats(year, month), billList({ startDate, endDate, pageNum: DefaultPagination.PageNum as number, pageSize: 5 })])
      .then(([statsRes, listRes]) => {
        setStats(statsRes.data)
        setRecentBills(listRes.data.records)
      })
      .finally(() => setLoading(false))
  }, [])

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex gap={token.marginLG}>
        <Card style={{ flex: 1 }}>
          <Statistic title={`${month}月收入`} value={stats.totalIncome} prefix="¥" precision={2} valueStyle={{ color: token.colorSuccess }} />
        </Card>
        <Card style={{ flex: 1 }}>
          <Statistic title={`${month}月支出`} value={stats.totalExpense} prefix="¥" precision={2} valueStyle={{ color: token.colorError }} />
        </Card>
        <Card style={{ flex: 1 }}>
          <Statistic title={`${month}月结余`} value={stats.balance} prefix="¥" precision={2} valueStyle={{ color: stats.balance >= 0 ? token.colorSuccess : token.colorError }} />
        </Card>
      </Flex>

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
                <span>{categoryMap.get(r.categoryId)?.icon} {categoryMap.get(r.categoryId)?.name || r.categoryName}</span>
              )
            },
            {
              title: '金额',
              dataIndex: 'amount',
              width: 130,
              render: (amount: number, r: BillVO) => (
                <span style={{ color: r.type === BillType.INCOME ? token.colorSuccess : token.colorError, fontWeight: token.fontWeightStrong }}>
                  {r.type === BillType.INCOME ? '+' : '-'}¥{amount.toFixed(2)}
                </span>
              )
            },
            {
              title: '类型',
              dataIndex: 'type',
              width: 80,
              render: (type: string) => <Tag color={type === BillType.INCOME ? 'green' : 'red'}>{BillTypeLabel[type as BillType]}</Tag>
            },
            { title: '备注', dataIndex: 'remark', ellipsis: true }
          ]}
        />
      </Card>
    </Flex>
  )
}
