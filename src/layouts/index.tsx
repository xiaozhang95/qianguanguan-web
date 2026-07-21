import { DownOutlined } from '@ant-design/icons'
import { Dropdown, Layout, Menu, Space } from 'antd'
import { Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Loading from '../components/loading'
import getRoutes from '../router'
import { RoutePath } from '../router/routes'
import { useAppDispatch, useAppSelector } from '../store'
import { setToken } from '../store/token'
import { setUserInfo } from '../store/userInfo'

const { Sider: LayoutSider, Content: LayoutContent, Header: LayoutHeader } = Layout

function PageHeader() {
  const nav = useNavigate()
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector((state) => state.userInfo)

  const handleLogout = () => {
    dispatch(setToken(''))
    dispatch(setUserInfo(null))
    nav(RoutePath.Login, { replace: true })
  }

  return (
    <div className="header">
      <div className="header-left"></div>
      <div className="header-right">
        <Space vertical>
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: <div onClick={handleLogout}>退出</div>
                }
              ]
            }}
            placement="bottomRight"
          >
            <span className="username">
              {userInfo?.name || userInfo?.username || ''}&nbsp;
              <DownOutlined />
            </span>
          </Dropdown>
        </Space>
      </div>
    </div>
  )
}

function PageMenu() {
  const location = useLocation()
  const nav = useNavigate()
  const key = location.pathname

  const userInfo = useAppSelector((state) => state.userInfo)

  return (
    <Menu
      onClick={(e: { key: string }) => {
        if (key === e.key) return
        nav(e.key)
      }}
      selectedKeys={[key]}
      mode="inline"
      items={getRoutes(userInfo?.role).map(({ path, meta }) => {
        return {
          label: meta.title,
          key: path,
          icon: <meta.Icon />
        }
      })}
    />
  )
}

export default function Admin() {
  return (
    <Layout>
      <LayoutHeader>
        <PageHeader></PageHeader>
      </LayoutHeader>
      <Layout>
        <LayoutSider>
          <PageMenu></PageMenu>
        </LayoutSider>
        <LayoutContent>
          <div className="container">
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </div>
        </LayoutContent>
      </Layout>
    </Layout>
  )
}
