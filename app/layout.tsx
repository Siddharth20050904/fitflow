import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import SessionProviderWrapper from './providers/SessionProviderWrapper'
import { Toaster } from "react-hot-toast";
const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitFlow - Gym Management System',
  description: 'Professional gym management system for owners and members',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#2a4b8c',
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} font-sans antialiased`}>
        <SessionProviderWrapper>
          {children}
          <Toaster position="top-right" />
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
