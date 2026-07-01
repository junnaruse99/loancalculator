import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Calculadora Hipotecaria',
  description: 'Simulador de amortización hipotecaria con pagos extra y cuota doble',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
