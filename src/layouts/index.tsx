import { DownOutlined } from '@ant-design/icons'
import { Dropdown, Layout, Menu, Space } from 'antd'
import { Suspense } from 'react'
import { useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Loading from '../components/loading'
import getRoutes from '../router'
import { RoutePath } from '../router/routes'
import type { RootState } from '../store'

const { Sider: LayoutSider, Content: LayoutContent, Header: LayoutHeader } = Layout

function PageHeader() {
  const nav = useNavigate()

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
                  label: (
                    <div
                      onClick={() => {
                        nav(RoutePath.Login)
                      }}
                    >
                      退出
                    </div>
                  )
                }
              ]
            }}
            placement="bottomRight"
          >
            <span className="username">
              &nbsp;
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

  const userInfo = useSelector((state: RootState) => state.userInfo)

  function onClick(e: { key: string }) {
    if (key === e.key) return
    nav(e.key)
  }

  return (
    <Menu
      onClick={onClick}
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
