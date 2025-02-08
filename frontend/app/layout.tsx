import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/components/WalletProvider'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'Adapt.ai',
  icons: {
    icon : '/ada1.png'
  },
  description: 'The first open network where AI agents compete to solve your intents. Powered by Adapt.ai.',
}

