import ErrorBoundary from '@/components/errorBoundary'
import Icon from '@/components/icon'
import Loading from '@/components/loading'
import PasswordModal from '@/components/passwordModal'
import ProfileModal from '@/components/profileModal'
import { Role } from '@/constants'
import { getPermittedRoutes, isGroup, type RouteDefinition } from '@/router'
import { RoutePath } from '@/router/routes'
import type { RootState } from '@/store'
import { setToken } from '@/store/token'
import { setUserInfo } from '@/store/userInfo'
import { DownOutlined, LockOutlined, LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Drawer, Dropdown, Flex, Layout, Menu, theme } from 'antd'
import { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Sider, Content, Header } = Layout

export default function AdminLayout() {
  const { token } = theme.useToken()
  const location = useLocation()
  const nav = useNavigate()
  const dispatch = useDispatch()
  const userInfo = useSelector((state: RootState) => state.userInfo)
  const routes = getPermittedRoutes(userInfo?.role as Role)

  const [activeKey, setActiveKey] = useState(location.pathname)
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const logout = () => {
    dispatch(setToken(''))
    dispatch(setUserInfo(null))
    nav(RoutePath.Login, { replace: true })
  }

  useEffect(() => {
    setActiveKey(location.pathname)
    for (const r of routes) {
      if (isGroup(r)) {
        if (r.children.some((c) => c.path === location.pathname)) {
          setOpenKeys((prev) => [...new Set([...prev, r.meta.title])])
          const child = r.children.find((c) => c.path === location.pathname)
          if (child) document.title = `${child.meta.title} - ${import.meta.env.VITE_NAME}`
          return
        }
      } else if (r.path === location.pathname) {
        document.title = `${r.meta.title} - ${import.meta.env.VITE_NAME}`
        return
      }
    }
  }, [location.pathname])

  const buildMenuItems = (defs: RouteDefinition[]) => {
    return defs.map((r) => {
      if (isGroup(r)) {
        return {
          key: r.meta.title,
          icon: <r.meta.Icon />,
          label: r.meta.title,
          children: r.children.map((c) => ({
            key: c.path,
            icon: <c.meta.Icon />,
            label: c.meta.title
          }))
        }
      }
      return {
        key: r.path,
        icon: <r.meta.Icon />,
        label: r.meta.title
      }
    })
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: token.colorBgLayout }}>
      <Sider className="layout-sider" style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10, background: token.colorBgContainer }}>
        <Flex
          align="center"
          gap={token.marginSM}
          style={{
            height: 64,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: `0 ${token.paddingMD}px`,
            userSelect: 'none',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 8px ${token.colorPrimary}40`,
              flexShrink: 0
            }}
          >
            <Icon name="logo" size={24} fill="#fff" />
          </div>
          <Flex vertical gap={0} style={{ lineHeight: 1.2 }}>
            <span style={{ fontWeight: token.fontWeightStrong, fontSize: token.fontSizeLG, whiteSpace: 'nowrap', color: token.colorText }}>{import.meta.env.VITE_NAME}</span>
            <span style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, whiteSpace: 'nowrap' }}>好好记账，天天向上</span>
          </Flex>
        </Flex>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={buildMenuItems(routes)}
          onClick={({ key }) => {
            if (activeKey !== key) {
              setActiveKey(key)
              nav(key)
            }
          }}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout className="layout-main">
        <Header
          style={{
            padding: `0 ${token.paddingLG}px`,
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            boxShadow: token.boxShadowTertiary,
            position: 'sticky',
            top: 0,
            zIndex: 9
          }}
        >
          <Flex align="center" gap={token.marginSM} className="show-on-mobile">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
            />
            <span style={{ fontWeight: token.fontWeightStrong, fontSize: token.fontSizeLG, color: token.colorText }}>{import.meta.env.VITE_NAME}</span>
          </Flex>
          <Flex style={{ marginLeft: 'auto' }}>
            <Dropdown
              menu={{
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: '个人信息',
                  onClick: () => setProfileOpen(true)
                },
                {
                  key: 'password',
                  icon: <LockOutlined />,
                  label: '修改密码',
                  onClick: () => setPasswordOpen(true)
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: logout
                }
              ]
            }}
            placement="bottomRight"
          >
            <Button type="text" style={{ color: token.colorText }}>
              {userInfo?.avatar ? (
                <img src={userInfo.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', marginRight: token.marginXS, verticalAlign: 'middle' }} />
              ) : (
                <UserOutlined style={{ marginRight: token.marginXS, fontSize: token.fontSizeXL, color: token.colorTextTertiary }} />
              )}
              <span className="hide-on-mobile">{userInfo?.name || userInfo?.username || ''} <DownOutlined /></span>
              <DownOutlined className="show-on-mobile" />
            </Button>
          </Dropdown>
          </Flex>
        </Header>

        <Content className="layout-content" style={{ padding: token.paddingLG, overflow: 'auto' }}>
          <Suspense fallback={<Loading />}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Suspense>
        </Content>
      </Layout>

      <ProfileModal open={profileOpen} userInfo={userInfo} onClose={() => setProfileOpen(false)} onSuccess={(info) => dispatch(setUserInfo(info))} />
      <PasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} onSuccess={logout} />
      <Drawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        styles={{ body: { padding: 0, background: token.colorBgContainer }, header: { background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorderSecondary}` } }}
        size={220}
        title={
          <Flex align="center" gap={token.marginSM}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${token.colorPrimary}40`,
                flexShrink: 0
              }}
            >
              <Icon name="logo" size={20} fill="#fff" />
            </div>
            <Flex vertical gap={0} style={{ lineHeight: 1.2 }}>
              <span style={{ fontWeight: token.fontWeightStrong, fontSize: token.fontSize, whiteSpace: 'nowrap', color: token.colorText }}>{import.meta.env.VITE_NAME}</span>
              <span style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary, whiteSpace: 'nowrap' }}>好好记账，天天向上</span>
            </Flex>
          </Flex>
        }
      >
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={buildMenuItems(routes)}
          onClick={({ key }) => {
            if (activeKey !== key) {
              setActiveKey(key)
              nav(key)
            }
            setMobileMenuOpen(false)
          }}
          style={{ borderRight: 0 }}
        />
      </Drawer>
    </Layout>
  )
}
