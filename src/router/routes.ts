export const RoutePath = {
  Home: '/',
  Login: '/login'
}

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath]
