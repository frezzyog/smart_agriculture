'use client'

import './globals.css'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Providers from './providers'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }) {
    const pathname = usePathname()
    const isAuthPage = pathname === '/login' || pathname === '/signup'

    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-background min-h-screen text-foreground" suppressHydrationWarning>
                <Providers>
                    {!isAuthPage && <Sidebar />}
                    <div className="flex flex-col">
                        {!isAuthPage && <Header />}
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    )
}
