import 'antd/dist/reset.css'
import './app.scss'

import { App as AntdApp, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { useEffect, useMemo, type ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { userInfo } from './api/user'
import Loading from './components/loading'
import { Role } from './constants'
import Layout from './layouts'
import Login from './pages/login'
import NotFound from './pages/notfound'
import { flattenRoutes } from './router'
import { RoutePath } from './router/routes'
import type { RootState } from './store'
import { setUserInfo } from './store/userInfo'
import { setMsgApi } from './utils/msgHolder'

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

function MsgInject() {
  const { message } = AntdApp.useApp()
  useEffect(() => {
    setMsgApi(message)
  }, [message])
  return null
}

function MenuThemeProvider({ children }: { children: ReactNode }) {
  const { token } = theme.useToken()
  const themeMode = useSelector((state: RootState) => state.theme)
  const isDark = themeMode === 'dark'

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            subMenuItemBg: 'transparent',
            itemSelectedColor: isDark ? token.colorWhite : token.colorPrimary,
            itemSelectedBg: isDark ? token.colorPrimary : token.colorPrimaryBg,
            subMenuItemSelectedColor: isDark ? token.colorWhite : token.colorPrimary
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default function App() {
  const userInfo = useSelector((state: RootState) => state.userInfo)
  const themeMode = useSelector((state: RootState) => state.theme)
  const routes = flattenRoutes(userInfo?.role as Role)

  const themeConfig = useMemo(() => {
    const isDark = themeMode === 'dark'
    return {
      cssVar: { prefix: 'ant' as const },
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        borderRadius: 6,
        ...(isDark
          ? {}
          : {
              colorBgLayout: '#e8ecf1',
              colorBgContainer: '#f7f8fa',
              colorBgElevated: '#ffffff'
            })
      }
    }
  }, [themeMode])

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <MenuThemeProvider>
        <AntdApp>
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
          <MsgInject />
        </AntdApp>
      </MenuThemeProvider>
    </ConfigProvider>
  )
}
