import { configureStore } from '@reduxjs/toolkit'
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import tokenReducer from './token'
import userInfoSlice, { type UserInfo } from './userInfo'

export interface RootState {
  token: string
  userInfo: UserInfo | null
}

const store = configureStore({
  reducer: {
    token: tokenReducer,
    userInfo: userInfoSlice
  }
})

export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
