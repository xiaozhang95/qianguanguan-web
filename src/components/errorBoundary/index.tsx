import { Component, type ReactNode } from 'react'

import { Button, Flex, Result } from 'antd'

import './index.scss'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ error: null })} />
    }
    return this.props.children
  }
}

function ErrorFallback({ onReset }: { error: Error; onReset: () => void }) {
  return (
    <Flex justify="center" align="center" className="error-fallback">
      <Result
        status="error"
        title="页面出错了"
        subTitle="请稍后重试"
        extra={
          <Button type="primary" onClick={onReset}>
            重试
          </Button>
        }
      />
    </Flex>
  )
}
