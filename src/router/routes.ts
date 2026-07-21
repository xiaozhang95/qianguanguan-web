export const RoutePath = {
  Home: '/',
  Login: '/login',
  HomePage: '/home',
  Bill: '/bill',
  Category: '/category'
}

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath]
