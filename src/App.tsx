import 'antd/dist/reset.css'

import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { userInfo } from './api/user'
import Loading from './components/loading'
import Layout from './layouts'
import Login from './pages/login'
import NotFound from './pages/notfound'
import { flattenRoutes } from './router'
import { RoutePath } from './router/routes'
import type { RootState } from './store'
import { setUserInfo } from './store/userInfo'

export function LoadAuth() {
  const dispatch = useDispatch()
  const nav = useNavigate()
  const token = useSelector((state: RootState) => state.token)

  useEffect(() => {
    if (!token) return
    userInfo()
      .then(({ data }) => {
        setTimeout(() => {
          dispatch(setUserInfo(data))
        }, 500)
      })
      .catch(() => {
        nav(RoutePath.Login)
      })
  }, [])

  return token ? <Loading /> : <Navigate to={RoutePath.Login} replace />
}

export default function App() {
  const userInfo = useSelector((state: RootState) => state.userInfo)
  const routes = flattenRoutes(userInfo?.role)

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          borderRadius: 6
        },
        components: {
          Menu: {
            subMenuItemBg: 'transparent',
            itemSelectedColor: '#fff',
            itemSelectedBg: '#1677ff80'
          }
        }
      }}
    >
      <Routes>
        <Route path={RoutePath.Login} element={<Login />} />
        {!routes.length ? (
          <Route path="/*" element={<LoadAuth />} />
        ) : (
          <Route path={RoutePath.Home} element={<Layout />}>
            <Route path={RoutePath.Home} element={<Navigate to={routes[0]?.path} />} />
            {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Route>
        )}
      </Routes>
    </ConfigProvider>
  )
}
