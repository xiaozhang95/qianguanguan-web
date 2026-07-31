import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'themeMode'

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'dark'
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState: getInitialTheme() as ThemeMode,
  reducers: {
    setThemeMode: (_, action: PayloadAction<ThemeMode>) => {
      localStorage.setItem(STORAGE_KEY, action.payload)
      return action.payload
    },
    toggleTheme: (state) => {
      const next = state === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    }
  }
})

export const { setThemeMode, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
