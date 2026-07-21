import { HomeOutlined, WalletOutlined, AppstoreOutlined } from '@ant-design/icons'
import { lazy } from 'react'
import { RoutePath } from './routes'

export const Permission = {
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  USER: '用户'
} as const
export type Permission = (typeof Permission)[keyof typeof Permission]

const Home = lazy(() => import('@/pages/home'))
const Bill = lazy(() => import('@/pages/bill'))
const Category = lazy(() => import('@/pages/category'))
const routes = [
  { path: RoutePath.HomePage, meta: { title: '首页', Icon: HomeOutlined, permissions: [Permission.SUPER_ADMIN, Permission.ADMIN, Permission.USER] }, Component: Home },
  { path: RoutePath.Bill, meta: { title: '账单', Icon: WalletOutlined, permissions: [Permission.SUPER_ADMIN, Permission.ADMIN, Permission.USER] }, Component: Bill },
  { path: RoutePath.Category, meta: { title: '分类管理', Icon: AppstoreOutlined, permissions: [Permission.SUPER_ADMIN, Permission.ADMIN, Permission.USER] }, Component: Category }
]

export default function getRoutes(permission?: string) {
  return !permission
    ? []
    : routes.filter(({ meta }) => {
        return !meta.permissions || (meta.permissions as Permission[]).includes(permission! as Permission)
      })
}
