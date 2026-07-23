import { Flex, Spin } from 'antd'
import './index.scss'

export default function Loading() {
  return (
    <Flex justify="center" align="center" className="loading-overlay">
      <Spin />
    </Flex>
  )
}
