import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type UserInfo } from '../api/login'

export type { UserInfo }

const stored = localStorage.getItem('userInfo')
const initialState: UserInfo | null = stored ? JSON.parse(stored) : null

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState: initialState as UserInfo | null,
  reducers: {
    setUserInfo: (_, action: PayloadAction<UserInfo | null>) => {
      return action.payload
    }
  }
})

export const { setUserInfo } = userInfoSlice.actions

export default userInfoSlice.reducer
