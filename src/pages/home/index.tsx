import { billList, billStats, type BillVO } from '@/api/bill'
import { BillType } from '@/constants'
import { Area, Pie } from '@ant-design/charts'
import { ArrowDownOutlined, ArrowUpOutlined, WalletOutlined } from '@ant-design/icons'
import { Card, DatePicker, Flex, Grid, Statistic, theme } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import type { RootState } from '@/store'
import './index.scss'

const { MonthPicker } = DatePicker

export default function HomePage() {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const themeMode = useSelector((state: RootState) => state.theme)
  const isDark = themeMode === 'dark'
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

    Promise.all([billStats(year, month), billList({ startDate, endDate, pageNum: 1, pageSize: daysInMonth * 2 })])
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
            expense: v.expense
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

  const areaData = useMemo(() => {
    return chartData.flatMap((d) => [
      { date: d.date, type: '支出', value: d.expense },
      { date: d.date, type: '收入', value: d.income }
    ])
  }, [chartData])

  const incomeColors = [token.colorSuccess, token.colorPrimary, token.cyan, token.gold, token.purple, token.volcano, token.colorWarning, token.geekblue, token.colorInfo, token.colorError]
  const expenseColors = [token.colorError, token.volcano, token.colorWarning, token.gold, token.purple, token.colorPrimary, token.cyan, token.geekblue, token.colorInfo, token.colorSuccess]

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" align="center" className="page-header">
        <MonthPicker
          value={filterMonth}
          onChange={(v) => {
            if (v) setFilterMonth(v)
          }}
          allowClear={false}
        />
      </Flex>

      <Flex gap={token.marginLG} wrap>
        <Card className="stat-card home-stat-card">
          <Statistic
            title={
              <Flex align="center" gap={token.marginXS}>
                <ArrowDownOutlined className="home-stat-icon home-stat-icon--expense" />
                <span className="home-stat-title">支出</span>
              </Flex>
            }
            value={stats.totalExpense}
            prefix="¥"
            precision={2}
            styles={{ value: { color: token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading3 } }}
          />
        </Card>
        <Card className="stat-card home-stat-card">
          <Statistic
            title={
              <Flex align="center" gap={token.marginXS}>
                <ArrowUpOutlined className="home-stat-icon home-stat-icon--income" />
                <span className="home-stat-title">收入</span>
              </Flex>
            }
            value={stats.totalIncome}
            prefix="¥"
            precision={2}
            styles={{ value: { color: token.colorSuccess, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading3 } }}
          />
        </Card>
        <Card className="stat-card home-stat-card">
          <Statistic
            title={
              <Flex align="center" gap={token.marginXS}>
                <WalletOutlined className="home-stat-icon home-stat-icon--balance" />
                <span className="home-stat-title">结余</span>
              </Flex>
            }
            value={stats.balance}
            prefix="¥"
            precision={2}
            styles={{ value: { color: stats.balance >= 0 ? token.colorSuccess : token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading3 } }}
          />
        </Card>
      </Flex>

      <Card title={<span className="home-chart-title">{`${monthText}收支趋势`}</span>} loading={loading}>
        <Area
          data={areaData}
          xField="date"
          yField="value"
          seriesField="type"
          autoFit
          height={320}
          shapeField="smooth"
          colorField="type"
          scale={{ color: { range: [token.colorError, token.colorSuccess] } }}
          line={{ shapeField: 'smooth', style: { strokeWidth: 2 } }}
          style={{ fillOpacity: 0.2 }}
          axis={{
            x: { labelFill: isDark ? token.colorWhite : token.colorTextSecondary, labelOpacity: 1, lineStroke: isDark ? token.colorWhite : token.colorBorder, tickStroke: isDark ? token.colorWhite : token.colorBorder, tickOpacity: 1 },
            y: { labelFill: isDark ? token.colorWhite : token.colorTextSecondary, labelOpacity: 1, gridStroke: isDark ? token.colorWhite : token.colorBorderSecondary, gridStrokeOpacity: isDark ? 1 : 0.5, lineStroke: isDark ? token.colorWhite : token.colorBorder, lineStrokeOpacity: 1, tickOpacity: 1 }
          }}
          legend={{ color: { itemLabelFill: isDark ? token.colorWhite : token.colorText, itemLabelFillOpacity: 1, itemLabelFontSize: token.fontSizeSM } }}
          tooltip={{
            channel: 'y',
            valueFormatter: (v: unknown) => `¥${Number(v).toFixed(2)}`
          }}
        />
      </Card>

      {(incomePieData.length > 0 || expensePieData.length > 0) && (
        <Flex gap={token.marginLG} wrap>
          {expensePieData.length > 0 && (
            <Card title={<span className="home-chart-title">{`${monthText}支出分类占比`}</span>} loading={loading} className="home-pie-card">
              <Pie
                data={expensePieData}
                angleField="value"
                colorField="name"
                autoFit
                height={isMobile ? 280 : 360}
                innerRadius={isMobile ? 0.6 : 0.45}
                scale={{ color: { range: expenseColors } }}
                label={
                  isMobile
                    ? false
                    : {
                        text: (d: { value: number }) => `¥${d.value.toFixed(2)}`,
                        position: 'outside',
                        style: { fill: isDark ? token.colorWhite : token.colorText, fillOpacity: 1, fontSize: token.fontSize, fontWeight: 'bold' },
                      }
                }
                legend={{ color: { itemLabelFill: isDark ? token.colorWhite : token.colorText, itemLabelFillOpacity: 1, itemLabelFontSize: token.fontSizeSM } }}
                tooltip={{
                  items: [
                    (d: { name: string; value: number }) => ({
                      name: d.name,
                      value: `¥${d.value.toFixed(2)}`
                    })
                  ]
                }}
                style={{ stroke: token.colorBgContainer, lineWidth: 2 }}
              />
            </Card>
          )}
          {incomePieData.length > 0 && (
            <Card title={<span className="home-chart-title">{`${monthText}收入分类占比`}</span>} loading={loading} className="home-pie-card">
              <Pie
                data={incomePieData}
                angleField="value"
                colorField="name"
                autoFit
                height={isMobile ? 280 : 360}
                innerRadius={isMobile ? 0.6 : 0.45}
                scale={{ color: { range: incomeColors } }}
                label={
                  isMobile
                    ? false
                    : {
                        text: (d: { value: number }) => `¥${d.value.toFixed(2)}`,
                        position: 'outside',
                        style: { fill: isDark ? token.colorWhite : token.colorText, fillOpacity: 1, fontSize: token.fontSize, fontWeight: 'bold' },
                      }
                }
                legend={{ color: { itemLabelFill: isDark ? token.colorWhite : token.colorText, itemLabelFillOpacity: 1, itemLabelFontSize: token.fontSizeSM } }}
                tooltip={{
                  items: [
                    (d: { name: string; value: number }) => ({
                      name: d.name,
                      value: `¥${d.value.toFixed(2)}`
                    })
                  ]
                }}
                style={{ stroke: token.colorBgContainer, lineWidth: 2 }}
              />
            </Card>
          )}
        </Flex>
      )}
    </Flex>
  )
}
