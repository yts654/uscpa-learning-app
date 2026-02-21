import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from '@/components/session-provider'

import './globals.css'

export const metadata: Metadata = {
  title: 'CPA Mastery | USCPA Study Platform',
  description: 'A premium study tool for the US CPA examination. Track progress, practice MCQs, and master all four exam sections.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#151933',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
