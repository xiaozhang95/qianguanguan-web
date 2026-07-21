import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type UserInfo } from '../api/login'

export type { UserInfo }

const stored = localStorage.getItem('userInfo')
const initialState: UserInfo | null = stored ? JSON.parse(stored) : null

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState: initialState as UserInfo | null,
  reducers: {
    set: (_, action: PayloadAction<UserInfo | null>) => {
      if (action.payload) {
        localStorage.setItem('userInfo', JSON.stringify(action.payload))
      } else {
        localStorage.removeItem('userInfo')
      }
      return action.payload
    }
  }
})

export const { set } = userInfoSlice.actions

export default userInfoSlice.reducer
