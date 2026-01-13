'use client'

import { useState } from 'react'
import { seedStaff } from './actions'
import { Database, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SeedButton({ workspaceId }: { workspaceId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSeed() {
        if (!confirm('Are you sure you want to add 100 fake staff members?')) return

        setLoading(true)
        await seedStaff(workspaceId)
        setLoading(false)
        router.refresh()
    }

    return (
        <button
            onClick={handleSeed}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-md hover:bg-amber-500/20 transition-colors"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
            Seed 100 Staff (Dev)
        </button>
    )
}
