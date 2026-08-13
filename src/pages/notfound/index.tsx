import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Empty, Flex } from 'antd'

import { RoutePath } from '@/router/routes'

import './index.scss'

export default function NotFoundPage() {
  const nav = useNavigate()

  useEffect(() => {
    document.title = `页面不存在 - ${import.meta.env.VITE_NAME}`
  }, [])

  return (
    <Flex justify="center" align="center" className="notfound-wrapper">
      <Empty description="抱歉，您访问的页面不存在" image={Empty.PRESENTED_IMAGE_SIMPLE}>
        <Button type="primary" onClick={() => nav(RoutePath.Statistics, { replace: true })}>
          返回首页
        </Button>
      </Empty>
    </Flex>
  )
}
