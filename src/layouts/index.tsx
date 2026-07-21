import Icon from '@/components/icon'
import Loading from '@/components/loading'
import getRoutes from '@/router'
import { RoutePath } from '@/router/routes'
import type { RootState } from '@/store'
import { setToken } from '@/store/token'
import { setUserInfo } from '@/store/userInfo'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Dropdown, Flex, Layout, Menu, theme } from 'antd'
import { Suspense } from 'react'
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
  const { token } = theme.useToken()
  const location = useLocation()
  const nav = useNavigate()
  const dispatch = useDispatch()
  const userInfo = useSelector((state: RootState) => state.userInfo)
  const routes = getRoutes(userInfo?.role)

  const selectedKey = location.pathname

  const menuItems = routes.map(({ path, meta }) => ({
    key: path,
    icon: <meta.Icon />,
    label: meta.title
  }))

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider style={siderStyle} theme="light">
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
          <span style={{ fontWeight: 700, fontSize: token.fontSizeHeading5, whiteSpace: 'nowrap', color: token.colorPrimary }}>
            {import.meta.env.VITE_NAME}
          </span>
        </Flex>
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
            <Flex align="center" gap={token.marginXS} style={{ cursor: 'pointer' }}>
              <Avatar size={32} icon={<UserOutlined />} />
              <span style={{ fontWeight: token.fontWeightStrong }}>
                {userInfo?.name || userInfo?.username || ''}
              </span>
            </Flex>
          </Dropdown>
        </Header>

        <Content style={{ padding: token.paddingLG, minHeight: 280 }}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  )
}
