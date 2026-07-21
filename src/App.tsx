import 'antd/dist/reset.css'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import Loading from './components/loading'
import Layout from './layouts'
import Login from './pages/login'
import getRoutes, { Permission } from './router'
import { RoutePath } from './router/routes'
import type { RootState } from './store'

function LoadingAuth() {
  const token = useSelector((state: RootState) => state.token)

  useEffect(() => {
    if (!token) return
  }, [])

  return token ? <Loading /> : <Navigate to={RoutePath.Login} />
}

export default function App() {
  const routes = getRoutes(Permission.SUPER_ADMIN)

  return (
    <ConfigProvider locale={zhCN}>
      <Routes>
        <Route path={RoutePath.Login} element={<Login />} />
        {!routes.length ? (
          <Route path="/*" element={<LoadingAuth />} />
        ) : (
          <Route path={RoutePath.Home} element={<Layout />}>
            <Route path={RoutePath.Home} element={<Navigate to={routes[0].path} />}></Route>
            {routes.map(({ path, Component }) => {
              return <Route key={path} path={path} element={<Component />} />
            })}
          </Route>
        )}
      </Routes>
    </ConfigProvider>
  )
}
