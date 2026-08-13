import { configureStore } from '@reduxjs/toolkit'

import themeReducer, { type ThemeMode } from './theme'
import tokenReducer from './token'
import userInfoSlice, { type UserInfo } from './userInfo'

export interface RootState {
  token: string
  userInfo: UserInfo | null
  theme: ThemeMode
}

const store = configureStore({
  reducer: {
    token: tokenReducer,
    userInfo: userInfoSlice,
    theme: themeReducer
  }
})

export default store
