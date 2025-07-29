import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MedStore Pro - Medical Store Management',
  description: 'Complete medical store management system with inventory, transactions, and compliance features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
