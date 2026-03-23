import { Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import CursorEffect from '@/components/CursorEffect'

/* ── Google Fonts via next/font (self-hosted, no external requests) ── */
const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: '3-WEEK MASTER PLAN',
  description: 'Academic back-on-track command centre',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bebas.variable} ${mono.variable}`}>
      <body className="relative min-h-screen">
        {/* Custom cursor — client only */}
        <CursorEffect />

        {/* Grain / noise overlay */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-10 opacity-[0.022]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />

        <main className="relative z-20 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
