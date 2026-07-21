import 'antd/dist/reset.css'

import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppSelector } from './store'
import Layout from './layouts'
import Login from './pages/login'
import getRoutes from './router'
import { RoutePath } from './router/routes'

export default function App() {
  const token = useAppSelector((state) => state.token)
  const userInfo = useAppSelector((state) => state.userInfo)
  const routes = getRoutes(userInfo?.role)

  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp>
        <Routes>
          <Route path={RoutePath.Login} element={token ? <Navigate to={RoutePath.Home} replace /> : <Login />} />
          {!token ? (
            <Route path="/*" element={<Navigate to={RoutePath.Login} replace />} />
          ) : (
            <Route path={RoutePath.Home} element={<Layout />}>
              <Route path={RoutePath.Home} element={<Navigate to={routes[0]?.path || RoutePath.Home} />} />
              {routes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
          )}
        </Routes>
      </AntdApp>
    </ConfigProvider>
  )
}
