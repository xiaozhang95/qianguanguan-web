import { Role } from '@/constants'
import { AppstoreOutlined, HomeOutlined, SettingOutlined, TeamOutlined, WalletOutlined } from '@ant-design/icons'
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { RoutePath } from './routes'

interface RouteMeta {
  title: string
  Icon: ComponentType
  roles: Role[]
}

export interface RouteItem {
  type?: 'item'
  path: string
  meta: RouteMeta
  Component: LazyExoticComponent<ComponentType>
}

interface RouteGroup {
  type: 'group'
  meta: RouteMeta
  children: RouteItem[]
}

export type RouteDefinition = RouteItem | RouteGroup

const Home = lazy(() => import('@/pages/home'))
const Bill = lazy(() => import('@/pages/bill'))
const Category = lazy(() => import('@/pages/category'))
const Users = lazy(() => import('@/pages/settings/users'))

const routes: RouteDefinition[] = [
  { path: RoutePath.HomePage, meta: { title: '首页', Icon: HomeOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.USER] }, Component: Home },
  { path: RoutePath.Bill, meta: { title: '账单', Icon: WalletOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.USER] }, Component: Bill },
  { path: RoutePath.Category, meta: { title: '分类管理', Icon: AppstoreOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.USER] }, Component: Category },
  {
    type: 'group',
    meta: { title: '系统设置', Icon: SettingOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    children: [{ path: RoutePath.Users, meta: { title: '用户列表', Icon: TeamOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN] }, Component: Users }]
  }
]

function isPermitted(route: RouteDefinition, role?: Role) {
  const roles = route.meta.roles
  return !roles || roles.includes(role!)
}

export function isGroup(route: RouteDefinition): route is RouteGroup {
  return route.type === 'group'
}

export function getPermittedRoutes(role?: Role) {
  if (!role) return []
  return routes.filter((r) => {
    if (isGroup(r)) {
      const children = r.children.filter((c) => isPermitted(c, role))
      return children.length > 0
    }
    return isPermitted(r, role)
  })
}

export function flattenRoutes(role?: Role) {
  if (!role) return []
  return routes.flatMap((r) => {
    if (isGroup(r)) {
      return r.children.filter((c) => isPermitted(c, role))
    }
    return isPermitted(r, role) ? [r] : []
  })
}
