import ErrorBoundary from '@/components/errorBoundary'
import Icon from '@/components/icon'
import Loading from '@/components/loading'
import ProfileModal from '@/components/profileModal'
import { Role } from '@/constants'
import { getPermittedRoutes, isGroup, type RouteDefinition } from '@/router'
import { RoutePath } from '@/router/routes'
import type { RootState } from '@/store'
import { setToken } from '@/store/token'
import { setUserInfo } from '@/store/userInfo'
import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Dropdown, Flex, Layout, Menu, theme } from 'antd'
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

  useEffect(() => {
    setActiveKey(location.pathname)
    const group = routes.find((r) => isGroup(r) && r.children.some((c) => c.path === location.pathname))
    if (group) {
      setOpenKeys((prev) => [...new Set([...prev, group.meta.title])])
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
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10, background: token.colorBgContainer }}>
        <Flex
          align="center"
          justify="center"
          gap={token.marginXS}
          style={{
            height: 64,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: `0 ${token.paddingMD}px`
          }}
        >
          <Icon name="logo" size={32} fill={token.colorPrimary} />
          <span style={{ fontWeight: 700, fontSize: token.fontSizeHeading5, whiteSpace: 'nowrap', color: token.colorText }}>{import.meta.env.VITE_NAME}</span>
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

      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            padding: `0 ${token.paddingLG}px`,
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: token.boxShadowTertiary,
            position: 'sticky',
            top: 0,
            zIndex: 9
          }}
        >
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
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    dispatch(setToken(''))
                    dispatch(setUserInfo(null))
                    nav(RoutePath.Login, { replace: true })
                  }
                }
              ]
            }}
            placement="bottomRight"
          >
            <Button type="text" style={{ color: token.colorText }}>
              {userInfo?.avatar && <img src={userInfo.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8, verticalAlign: 'middle' }} />}
              {userInfo?.name || userInfo?.username || ''} <DownOutlined />
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ padding: token.paddingLG, minHeight: 280 }}>
          <Suspense fallback={<Loading />}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Suspense>
        </Content>
      </Layout>

      <ProfileModal
        open={profileOpen}
        userInfo={userInfo}
        onClose={() => setProfileOpen(false)}
        onSuccess={(info) => dispatch(setUserInfo(info))}
      />
    </Layout>
  )
}
