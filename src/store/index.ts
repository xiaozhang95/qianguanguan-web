import { configureStore } from '@reduxjs/toolkit'
import tokenReducer from './token'
import userInfoSlice, { type UserInfo } from './userInfo'

export interface RootState {
  token: string
  userInfo: UserInfo | null
}

export default configureStore({
  reducer: {
    token: tokenReducer,
    userInfo: userInfoSlice
  }
})
