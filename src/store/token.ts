import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const tokenSlice = createSlice({
  name: 'token',
  initialState: localStorage.getItem('token') || '',
  reducers: {
    setToken: (_, action: PayloadAction<string>) => {
      const token = action.payload || ''
      localStorage.setItem('token', token)
      return token
    }
  }
})

export const { setToken } = tokenSlice.actions

export default tokenSlice.reducer
