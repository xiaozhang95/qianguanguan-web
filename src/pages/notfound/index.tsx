import { RoutePath } from '@/router/routes'
import { Button, Empty, Flex } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const nav = useNavigate()

  return (
    <Flex justify="center" align="center" style={{ minHeight: '60vh' }}>
      <Empty
        description="抱歉，您访问的页面不存在"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => nav(RoutePath.HomePage, { replace: true })}>
          返回首页
        </Button>
      </Empty>
    </Flex>
  )
}
