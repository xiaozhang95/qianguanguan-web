import { billList, billStats, type BillVO } from '@/api/bill'
import { BillType } from '@/constants'
import { ArrowDownOutlined, ArrowUpOutlined, WalletOutlined } from '@ant-design/icons'
import { Card, DatePicker, Flex, Statistic, theme } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './index.scss'

const { MonthPicker } = DatePicker

export default function HomePage() {
  const { token } = theme.useToken()
  const location = useLocation()
  const [filterMonth, setFilterMonth] = useState<dayjs.Dayjs>(dayjs())
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [chartData, setChartData] = useState<{ date: string; income: number; expense: number }[]>([])
  const [incomePieData, setIncomePieData] = useState<{ name: string; value: number }[]>([])
  const [expensePieData, setExpensePieData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(false)
  const month = filterMonth.format('M')
  const year = filterMonth.format('YYYY')
  const monthText = filterMonth.format('YYYY年M月')

  useEffect(() => {
    const startDate = filterMonth.startOf('month').format('YYYY-MM-DD')
    const endDate = filterMonth.endOf('month').format('YYYY-MM-DD')
    const daysInMonth = filterMonth.daysInMonth()

    setLoading(true)

    Promise.all([
      billStats(year, month),
      billList({ startDate, endDate, pageNum: 1, pageSize: daysInMonth * 2 }),
    ])
      .then(([statsRes, listRes]) => {
        setStats(statsRes.data)

        const dailyMap = new Map<string, { income: number; expense: number }>()
        for (let i = 1; i <= daysInMonth; i++) {
          const d = filterMonth.date(i).format('YYYY-MM-DD')
          dailyMap.set(d, { income: 0, expense: 0 })
        }
        listRes.data.records.forEach((b: BillVO) => {
          const entry = dailyMap.get(b.billDate)
          if (entry) {
            if (b.type === BillType.INCOME) entry.income += b.amount
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

        const incomeMap = new Map<string, number>()
        const expenseMap = new Map<string, number>()
        listRes.data.records.forEach((b: BillVO) => {
          if (b.type === BillType.INCOME) {
            incomeMap.set(b.categoryName, (incomeMap.get(b.categoryName) || 0) + b.amount)
          } else {
            expenseMap.set(b.categoryName, (expenseMap.get(b.categoryName) || 0) + b.amount)
          }
        })
        setIncomePieData(
          Array.from(incomeMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        )
        setExpensePieData(
          Array.from(expenseMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        )
      })
      .finally(() => setLoading(false))
  }, [location.pathname, filterMonth, month, year])

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" align="center" className="page-header">
        <MonthPicker value={filterMonth} onChange={(v) => { if (v) setFilterMonth(v) }} allowClear={false} />
      </Flex>

        <Flex gap={token.marginLG} wrap>
        <Card className="stat-card home-stat-card">
          <Statistic
            title={<Flex align="center" gap={token.marginXS}><ArrowUpOutlined className="home-stat-icon home-stat-icon--income" /><span className="home-stat-title">收入</span></Flex>}
            value={stats.totalIncome}
            prefix="¥"
            precision={2}
            styles={{ value: { color: token.colorSuccess, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading3 } }}
          />
        </Card>
        <Card className="stat-card home-stat-card">
          <Statistic
            title={<Flex align="center" gap={token.marginXS}><ArrowDownOutlined className="home-stat-icon home-stat-icon--expense" /><span className="home-stat-title">支出</span></Flex>}
            value={stats.totalExpense}
            prefix="¥"
            precision={2}
            styles={{ value: { color: token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading3 } }}
          />
        </Card>
        <Card className="stat-card home-stat-card">
          <Statistic
            title={<Flex align="center" gap={token.marginXS}><WalletOutlined className="home-stat-icon home-stat-icon--balance" /><span className="home-stat-title">结余</span></Flex>}
            value={stats.balance}
            prefix="¥"
            precision={2}
            styles={{ value: { color: stats.balance >= 0 ? token.colorSuccess : token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading3 } }}
          />
        </Card>
      </Flex>

      <Card title={<span className="home-chart-title">{`${monthText}收支趋势`}</span>} loading={loading}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
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
            <XAxis dataKey="date" tick={{ fill: token.colorTextSecondary, fontSize: token.fontSizeSM }} axisLine={{ stroke: token.colorBorderSecondary }} padding={{ left: 0, right: 0 }} />
            <YAxis tick={{ fill: token.colorTextSecondary, fontSize: token.fontSizeSM }} axisLine={{ stroke: token.colorBorderSecondary }} />
            <Tooltip
              formatter={(value: unknown) => [`¥${Number(value).toFixed(2)}`, '']}
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

      {(incomePieData.length > 0 || expensePieData.length > 0) && (
      <Flex gap={token.marginLG} wrap>
          {incomePieData.length > 0 && (
            <Card title={<span className="home-chart-title">{`${monthText}收入分类占比`}</span>} loading={loading} className="home-pie-card">
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ value }) => `¥${value.toFixed(2)}`}
                  >
                    {incomePieData.map((_, i) => {
                      const colors = [token.colorSuccess, token.colorPrimary, token.colorInfo, token.geekblue, token.cyan, token.gold, token.purple, token.volcano, token.colorWarning, token.colorError]
                      return <Cell key={i} fill={colors[i % colors.length]} />
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => [`¥${Number(value).toFixed(2)}`, '']}
                    contentStyle={{
                      background: token.colorBgElevated,
                      border: `1px solid ${token.colorBorder}`,
                      borderRadius: token.borderRadius,
                      boxShadow: token.boxShadowSecondary,
                    }}
                    labelStyle={{ color: token.colorText }}
                  />
                  <Legend
                    formatter={(value: string) => <span className="home-legend-text">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
          {expensePieData.length > 0 && (
            <Card title={<span className="home-chart-title">{`${monthText}支出分类占比`}</span>} loading={loading} className="home-pie-card">
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ value }) => `¥${value.toFixed(2)}`}
                  >
                    {expensePieData.map((_, i) => {
                      const colors = [token.colorError, token.volcano, token.colorWarning, token.gold, token.purple, token.colorPrimary, token.colorInfo, token.geekblue, token.cyan, token.colorSuccess]
                      return <Cell key={i} fill={colors[i % colors.length]} />
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => [`¥${Number(value).toFixed(2)}`, '']}
                    contentStyle={{
                      background: token.colorBgElevated,
                      border: `1px solid ${token.colorBorder}`,
                      borderRadius: token.borderRadius,
                      boxShadow: token.boxShadowSecondary,
                    }}
                    labelStyle={{ color: token.colorText }}
                  />
                  <Legend
                    formatter={(value: string) => <span className="home-legend-text">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </Flex>
      )}
    </Flex>
  )
}
