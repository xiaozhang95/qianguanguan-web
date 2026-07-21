import { configureStore } from '@reduxjs/toolkit'
import tokenReducer from './token'

export interface RootState {
  token: string
}

export default configureStore({
  reducer: {
    token: tokenReducer
  }
})
