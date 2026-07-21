import { HomeOutlined } from '@ant-design/icons'
import { lazy } from 'react'

const Home = lazy(() => import('../home'))

const Permission = {
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  USER: '用户'
} as const
type Permission = (typeof Permission)[keyof typeof Permission]

const routes = [{ path: '/home', meta: { title: '首页', Icon: HomeOutlined, permissions: [Permission.SUPER_ADMIN] }, Component: Home }]

export default function getRoutes(permission?: string) {
  return !permission
    ? []
    : routes.filter(({ meta }) => {
        return !meta.permissions || (meta.permissions as Permission[]).includes(permission! as Permission)
      })
}
