import './globals.css'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Providers from './providers'

export const metadata = {
    title: 'កសិកម្ម 4.0 Ecosystem',
    description: 'Smart Agriculture monitoring and control system',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-background min-h-screen text-foreground" suppressHydrationWarning>
                <Providers>
                    <Sidebar />
                    <div className="flex flex-col">
                        <Header />
                        <main className="flex-1">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    )
}
