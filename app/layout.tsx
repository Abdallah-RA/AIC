// app/layout.tsx

import './globals.css'
import React from 'react'

export const metadata = {
  title: 'AIC – Academic Industrial Club',
  description: 'Connecting Students and Industry',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
