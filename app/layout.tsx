import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'Decision Journal',
    template: '%s — Decision Journal',
  },
  description:
    'Track predictions before you make them. Compare what you believed versus what happened. Get better at making decisions.',
  robots: { index: false, follow: false }, // private app
}

import { AuthProvider } from '@/components/layout/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} ${playfair.variable}`}
    >
      <body className="bg-app-bg text-ink-primary font-body antialiased min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
