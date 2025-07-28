import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutContent from './layout-content';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Shifa Nour - Dry Fruits',
  description: 'Discover authentic Indian products from artisans across Bharat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutContent>
          {children}
        </LayoutContent>
      </body>
    </html>
  )
}