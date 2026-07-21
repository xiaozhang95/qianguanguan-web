import { billList, billStats, type BillVO } from '@/api/bill'
import { Card, Flex, Statistic, theme } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function HomePage() {
  const { token } = theme.useToken()
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [chartData, setChartData] = useState<{ date: string; income: number; expense: number }[]>([])
  const [loading, setLoading] = useState(false)
  const month = dayjs().format('M')

  useEffect(() => {
    const now = dayjs()
    const year = now.format('YYYY')
    const startDate = now.startOf('month').format('YYYY-MM-DD')
    const endDate = now.endOf('month').format('YYYY-MM-DD')
    const daysInMonth = now.daysInMonth()

    setLoading(true)

    Promise.all([
      billStats(year, month),
      billList({ startDate, endDate, pageNum: 1, pageSize: daysInMonth * 2 }),
    ])
      .then(([statsRes, listRes]) => {
        setStats(statsRes.data)

        const dailyMap = new Map<string, { income: number; expense: number }>()
        for (let i = 1; i <= daysInMonth; i++) {
          const d = now.date(i).format('YYYY-MM-DD')
          dailyMap.set(d, { income: 0, expense: 0 })
        }
        listRes.data.records.forEach((b: BillVO) => {
          const entry = dailyMap.get(b.billDate)
          if (entry) {
            if (b.type === 'INCOME') entry.income += b.amount
            else entry.expense += b.amount
          }
        })
        setChartData(
          Array.from(dailyMap.entries()).map(([date, v]) => ({
            date: dayjs(date).format('D日'),
            income: v.income,
            expense: v.expense,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex gap={token.marginLG}>
        <Card style={{ flex: 1 }}>
          <Statistic
            title={<span style={{ fontSize: token.fontSizeLG, fontWeight: token.fontWeightStrong }}>{`${month}月收入`}</span>}
            value={stats.totalIncome}
            prefix="¥"
            precision={2}
            styles={{ value: { color: token.colorSuccess, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading2 } }}
          />
        </Card>
        <Card style={{ flex: 1 }}>
          <Statistic
            title={<span style={{ fontSize: token.fontSizeLG, fontWeight: token.fontWeightStrong }}>{`${month}月支出`}</span>}
            value={stats.totalExpense}
            prefix="¥"
            precision={2}
            styles={{ value: { color: token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading2 } }}
          />
        </Card>
        <Card style={{ flex: 1 }}>
          <Statistic
            title={<span style={{ fontSize: token.fontSizeLG, fontWeight: token.fontWeightStrong }}>{`${month}月结余`}</span>}
            value={stats.balance}
            prefix="¥"
            precision={2}
            styles={{ value: { color: stats.balance >= 0 ? token.colorSuccess : token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading2 } }}
          />
        </Card>
      </Flex>

      <Card title={`${month}月收支趋势`} loading={loading}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={token.colorSuccess} stopOpacity={0.3} />
                <stop offset="100%" stopColor={token.colorSuccess} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={token.colorError} stopOpacity={0.3} />
                <stop offset="100%" stopColor={token.colorError} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorderSecondary} />
            <XAxis dataKey="date" tick={{ fill: token.colorTextSecondary, fontSize: 12 }} axisLine={{ stroke: token.colorBorderSecondary }} padding={{ left: 0, right: 0 }} />
            <YAxis tick={{ fill: token.colorTextSecondary, fontSize: 12 }} axisLine={{ stroke: token.colorBorderSecondary }} />
            <Tooltip
              formatter={(value: number | string) => [`¥${Number(value).toFixed(2)}`, '']}
              contentStyle={{
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                boxShadow: token.boxShadowSecondary,
              }}
              labelStyle={{ color: token.colorText }}
            />
            <Area type="monotone" dataKey="income" name="收入" stroke={token.colorSuccess} strokeWidth={2} fill="url(#incomeGradient)" dot={{ r: 2, fill: token.colorSuccess }} activeDot={{ r: 5, stroke: token.colorSuccess, fill: token.colorBgElevated }} />
            <Area type="monotone" dataKey="expense" name="支出" stroke={token.colorError} strokeWidth={2} fill="url(#expenseGradient)" dot={{ r: 2, fill: token.colorError }} activeDot={{ r: 5, stroke: token.colorError, fill: token.colorBgElevated }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </Flex>
  )
}
