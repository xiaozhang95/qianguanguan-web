import { Spin } from 'antd'

export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate3d(-50%, -50%, 0)'
      }}
    >
      <Spin></Spin>
    </div>
  )
}
