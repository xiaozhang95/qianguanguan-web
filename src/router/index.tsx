import { type ComponentType, type LazyExoticComponent, lazy } from 'react'

import { AppstoreOutlined, PieChartOutlined, SettingOutlined, TeamOutlined, WalletOutlined } from '@ant-design/icons'

import { Role } from '@/constants'

import { RoutePath } from './routes'

const Home = lazy(() => import('@/pages/home'))
const Bill = lazy(() => import('@/pages/bill'))
const Category = lazy(() => import('@/pages/category'))

interface RouteMeta {
  title: string
  Icon: ComponentType
  roles: Role[]
}

export interface RouteItem {
  type?: 'item'
  path: string
  meta: RouteMeta
  Component: ComponentType | LazyExoticComponent<ComponentType>
}

export interface RouteGroup {
  type: 'group'
  meta: RouteMeta
  children: RouteItem[]
}

export type RouteDefinition = RouteItem | RouteGroup

const Users = lazy(() => import('@/pages/settings/users'))

const routes: RouteDefinition[] = [
  { path: RoutePath.Statistics, meta: { title: '统计管理', Icon: PieChartOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.USER] }, Component: Home },
  { path: RoutePath.Bill, meta: { title: '账单管理', Icon: WalletOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.USER] }, Component: Bill },
  { path: RoutePath.Category, meta: { title: '分类管理', Icon: AppstoreOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.USER] }, Component: Category },
  {
    type: 'group',
    meta: { title: '系统设置', Icon: SettingOutlined, roles: [Role.SUPER_ADMIN] },
    children: [{ path: RoutePath.Users, meta: { title: '用户列表', Icon: TeamOutlined, roles: [Role.SUPER_ADMIN] }, Component: Users }]
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
