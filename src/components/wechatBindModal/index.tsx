import { useCallback, useEffect, useRef, useState } from 'react'

import { App, Flex, Modal, Spin, Typography } from 'antd'

import { checkWechatBindStatus, getWechatBindScene } from '@/api/user'

import './index.scss'

const { Text } = Typography

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function WechatBindModal({ open, onClose, onSuccess }: Props) {
  const { message } = App.useApp()
  const [qrImage, setQrImage] = useState('')
  const [sceneId, setSceneId] = useState('')
  const [qrStatus, setQrStatus] = useState('')
  const pollingRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = undefined
    }
  }, [])

  const startBind = useCallback(() => {
    setQrStatus('loading')
    setQrImage('')
    getWechatBindScene()
      .then(({ data }) => {
        setQrImage(data.qrImage)
        setSceneId(data.sceneId)
        setQrStatus('pending')
      })
      .catch(() => {
        setQrStatus('')
        onClose()
      })
  }, [onClose])

  useEffect(() => {
    if (open) {
      startBind()
    }
    return () => stopPolling()
  }, [open, startBind, stopPolling])

  useEffect(() => {
    if (qrStatus === 'pending' && sceneId) {
      stopPolling()
      pollingRef.current = setInterval(() => {
        checkWechatBindStatus(sceneId)
          .then(({ data }) => {
            if (data.status === 'confirmed') {
              stopPolling()
              setQrStatus('confirmed')
              message.success('微信绑定成功')
              onSuccess()
              onClose()
            } else if (data.status === 'expired') {
              stopPolling()
              setQrStatus('expired')
            }
          })
          .catch(() => {})
      }, 2000)
    }
    return stopPolling
  }, [qrStatus, sceneId, stopPolling, message, onSuccess, onClose])

  return (
    <Modal title="绑定微信" open={open} onCancel={onClose} footer={null} width={360}>
      <Flex vertical align="center" className="wechat-bind-modal">
        {qrStatus === 'loading' && <Spin size="large" />}
        {qrImage && (
          <div className="wechat-bind-qr-wrap">
            <img src={qrImage} alt="绑定二维码" className="wechat-bind-qr-img" />
            {qrStatus === 'expired' && (
              <div className="wechat-bind-qr-overlay" onClick={startBind}>
                <span>已过期</span>
                <span className="wechat-bind-qr-refresh">点击刷新</span>
              </div>
            )}
          </div>
        )}
        {qrStatus === 'pending' && <Text type="secondary">请使用微信扫码确认绑定</Text>}
      </Flex>
    </Modal>
  )
}
