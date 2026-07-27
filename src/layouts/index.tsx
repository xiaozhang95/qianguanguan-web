import logo from '@/assets/images/logo.png'
import ErrorBoundary from '@/components/errorBoundary'
import Loading from '@/components/loading'
import PasswordModal from '@/components/passwordModal'
import ProfileModal from '@/components/profileModal'
import { Role } from '@/constants'
import { getPermittedRoutes, isGroup, type RouteDefinition } from '@/router'
import { RoutePath } from '@/router/routes'
import type { RootState } from '@/store'
import { setToken } from '@/store/token'
import { setUserInfo } from '@/store/userInfo'
import { DownOutlined, LockOutlined, LogoutOutlined, MenuOutlined, UserOutlined, WechatOutlined } from '@ant-design/icons'
import { Button, Drawer, Dropdown, Flex, Layout, Menu, theme } from 'antd'
import { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './index.scss'

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
    <Layout className="layout-root">
      <Sider className="layout-sider">
        <Flex align="center" gap={token.marginSM} className="layout-sider-brand">
          <img src={logo} className="layout-logo-img" alt="logo" />
          <Flex vertical gap={0} className="layout-sider-brand-name">
            <span className="layout-brand-title">{import.meta.env.VITE_NAME}</span>
            <span className="layout-brand-subtitle">好好记账，天天向上</span>
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
          className="layout-menu"
        />
      </Sider>

      <Layout className="layout-main">
        <Header className="layout-header">
          <Flex align="center" gap={token.marginXS} className="show-on-mobile">
            <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)} />
            <span className="layout-brand-title">{import.meta.env.VITE_NAME}</span>
          </Flex>
          <Flex className="layout-header-user">
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
              <Button type="text" className="layout-user-btn">
                {userInfo?.avatar ? <img src={userInfo.avatar} alt="" className="layout-user-avatar-img" /> : <UserOutlined className="layout-user-avatar-icon" />}
                <span className="hide-on-mobile layout-user-name">
                  {userInfo?.name || userInfo?.username || ''}
                  {userInfo?.wid && <WechatOutlined className="layout-wechat-icon" />}
                  <DownOutlined />
                </span>
              </Button>
            </Dropdown>
          </Flex>
        </Header>

        <Content className="layout-content">
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
        styles={{
          body: { padding: 0, background: 'var(--ant-color-bg-container)' },
          header: { background: 'var(--ant-color-bg-container)', borderBottom: '1px solid var(--ant-color-border-secondary)' }
        }}
        size={220}
        title={
          <Flex align="center" gap={token.marginSM}>
            <img src={logo} className="layout-drawer-logo-img" alt="logo" />
            <Flex vertical gap={0} className="layout-sider-brand-name">
              <span className="layout-drawer-brand-title">{import.meta.env.VITE_NAME}</span>
              <span className="layout-drawer-brand-subtitle">好好记账，天天向上</span>
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
          className="layout-menu"
        />
      </Drawer>
    </Layout>
  )
}
