'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push('/dashboard')
            } else {
                router.push('/login')
            }
        }
    }, [user, loading, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full"></div>
                <p className="text-foreground/50 font-medium">Loading your farm...</p>
            </div>
        </div>
    )
}
