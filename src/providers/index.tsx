import React from 'react'

import { CartProvider } from './Cart'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <CartProvider>{children}</CartProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
