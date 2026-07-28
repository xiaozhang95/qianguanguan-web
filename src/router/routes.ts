export const RoutePath = {
  Home: '/',
  Login: '/login',
  Statistics: '/statistics',
  Bill: '/bill',
  Category: '/category',
  Users: '/settings/users'
}

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath]
