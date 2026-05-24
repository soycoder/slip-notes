import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { storage } from '@/lib/storage'
import { DARK, LIGHT } from '@/constants/colors'

type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  colors: typeof LIGHT
  toggle: () => void
  setTheme: (t: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  colors: LIGHT,
  toggle: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [theme, setThemeState] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light')

  useEffect(() => {
    storage.getTheme().then((saved) => {
      if (saved) setThemeState(saved)
    })
  }, [])

  function setTheme(t: ThemeMode) {
    setThemeState(t)
    storage.setTheme(t)
  }

  function toggle() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const colors = theme === 'dark' ? DARK : LIGHT

  return (
    <ThemeContext.Provider value={{ theme, colors, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
