import Icon from '@/components/icon'
import Loading from '@/components/loading'
import getRoutes from '@/router'
import { RoutePath } from '@/router/routes'
import type { RootState } from '@/store'
import { setToken } from '@/store/token'
import { setUserInfo } from '@/store/userInfo'
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Breadcrumb, Button, Dropdown, Layout, Menu } from 'antd'
import { Suspense, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Sider, Content, Header } = Layout

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: 10
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const nav = useNavigate()
  const dispatch = useDispatch()
  const userInfo = useSelector((state: RootState) => state.userInfo)
  const routes = getRoutes(userInfo?.role)

  const selectedKey = location.pathname

  const handleLogout = () => {
    dispatch(setToken(''))
    dispatch(setUserInfo(null))
    nav(RoutePath.Login, { replace: true })
  }

  const menuItems = routes.map(({ path, meta }) => ({
    key: path,
    icon: <meta.Icon />,
    label: meta.title
  }))

  const currentRoute = routes.find((r) => r.path === selectedKey)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={siderStyle} theme="light">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 16px',
            gap: 8
          }}
        >
          <Icon name="logo" size={32} />
          {!collapsed && <span style={{ fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>钱罐罐</span>}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            if (selectedKey !== key) nav(key)
          }}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 9
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
            <Breadcrumb items={[{ title: '首页', path: '/' }, ...(currentRoute ? [{ title: currentRoute.meta.title }] : [])]} style={{ fontSize: 14 }} />
          </div>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: handleLogout
                }
              ]
            }}
            placement="bottomRight"
          >
            <div
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Avatar size={32} icon={<UserOutlined />} />
              <span style={{ fontWeight: 500 }}>{userInfo?.name || userInfo?.username || ''}</span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24, minHeight: 280 }}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  )
}
