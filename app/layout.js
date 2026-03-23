import './globals.css'

export const metadata = {
  title: '3-Week Back-on-Track',
  description: 'Your personal 3-week academic catch-up checklist',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen">
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
