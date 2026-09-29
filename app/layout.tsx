import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AlimShare LMS',
    template: '%s | AlimShare LMS',
  },
  description: 'Platform pembelajaran online terpadu untuk guru dan siswa',
  keywords: ['LMS', 'e-learning', 'kursus online', 'AlimShare'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
