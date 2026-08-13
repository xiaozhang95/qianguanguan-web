import { type PayloadAction, createSlice } from '@reduxjs/toolkit'

import { type UserInfo } from '@/api/login'

export type { UserInfo }

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState: null as UserInfo | null,
  reducers: {
    setUserInfo: (_, action: PayloadAction<UserInfo | null>) => {
      return action.payload
    }
  }
})

export const { setUserInfo } = userInfoSlice.actions

export default userInfoSlice.reducer
