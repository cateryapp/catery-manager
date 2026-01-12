'use client'

import { createWorkspace } from '../actions'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function CreateWorkspacePage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // wrapper to handle loading state
    async function onSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await createWorkspace(formData) // will redirect on success
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Create Workspace</h1>
                    <p className="text-muted-foreground text-sm">Give your company a home.</p>
                </div>

                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name</label>
                        <input
                            name="name"
                            required
                            placeholder="Acme Catering Co."
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium hover:bg-white/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Workspace'}
                    </button>
                </form>
            </div>
        </div>
    )
}
