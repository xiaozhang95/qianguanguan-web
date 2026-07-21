import { Flex, Spin, theme } from 'antd'

export default function Loading() {
  const { token } = theme.useToken()

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        position: 'fixed',
        inset: 0,
        background: token.colorBgContainer,
      }}
    >
      <Spin size="large" />
    </Flex>
  )
}
