import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flex Living Reviews Dashboard',
  description: 'Property management reviews dashboard for Flex Living',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
