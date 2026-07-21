import { createSlice } from '@reduxjs/toolkit'

export interface UserInfo {
  id: number
  phone: string
  email: string
  createtime: string
  name: string
  role: string
}

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState: null,
  reducers: {
    set: (_, action) => {
      return action.payload
    }
  }
})

export const { set } = userInfoSlice.actions

export default userInfoSlice.reducer
