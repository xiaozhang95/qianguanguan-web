import 'antd/dist/reset.css'
import './app.scss'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useNavigate, type NavigateProps } from 'react-router-dom'
import Loading from './components/loading'
import Layout from './layouts'
import Login from './pages/login'
import Notfound from './pages/notfound'
import getRoutes from './router'
import { RoutePath } from './router/routes'
import type { RootState } from './store'

export interface RC {
  meta: {
    title?: string
  }
  Component: import('react').FC
}

function NavigateComponent({ to }: NavigateProps) {
  return <Navigate to={to} />
}

function RouteComponent({ Component, meta }: RC) {
  document.title = meta.title!
  return <Component />
}

function LoadingAuth() {
  const token = useSelector((state: RootState) => state.token)
  const dispatch = useDispatch()
  const nav = useNavigate()

  useEffect(() => {
    if (!token) return
  }, [token, dispatch, nav])

  return token ? <Loading /> : NavigateComponent({ to: RoutePath.Login })
}

export default function App() {
  const userInfo = useSelector((state: RootState) => state.userInfo)
  const routes = getRoutes(userInfo?.role)

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        components: {
          Table: {
            cellPaddingBlock: 12
          }
        }
      }}
    >
      <Routes>
        <Route path={RoutePath.Login} element={<RouteComponent Component={Login} meta={{ title: '登录' }} />} />
        {!routes.length ? (
          <Route path="/*" element={<LoadingAuth />} />
        ) : (
          <Route path={RoutePath.Home} element={<RouteComponent Component={Layout} meta={{}} />}>
            <Route path={RoutePath.Home} element={<NavigateComponent to={routes[0].path} />}></Route>
            {routes.map(({ path, Component, meta }) => {
              return <Route key={path} path={path} element={<RouteComponent Component={Component} meta={meta} />} />
            })}
          </Route>
        )}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </ConfigProvider>
  )
}
