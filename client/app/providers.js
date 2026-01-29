'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'

import { SidebarProvider } from '@/context/SidebarContext'
import '@/lib/i18n'

export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                retry: 1,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
                <Toaster position="top-right" />
            </ThemeProvider>
        </QueryClientProvider>
    )
}
