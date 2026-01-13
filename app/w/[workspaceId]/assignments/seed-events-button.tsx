'use client'

import { useState } from 'react'
import { seedEvents } from '../events/actions'
import { Loader2, Wand2 } from 'lucide-react'

export default function SeedEventsButton({ workspaceId }: { workspaceId: string }) {
    const [loading, setLoading] = useState(false)

    const handleSeed = async () => {
        if (!confirm('Generate 28 test events for the next 14 days?')) return
        setLoading(true)
        try {
            await seedEvents(workspaceId)
            alert('Events created!')
            window.location.reload() // Force reload to see new data in server components
        } catch (e) {
            alert('Failed to seed events')
            console.error(e)
        }
        setLoading(false)
    }

    // Only show in development
    if (process.env.NODE_ENV !== 'development') return null

    return (
        <button
            onClick={handleSeed}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 rounded-md text-xs font-medium border border-yellow-500/20 transition-colors"
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            Seed Events
        </button>
    )
}
