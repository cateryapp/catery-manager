'use client'

import { createEvent } from '../actions'
import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewEventPage({
    params,
    searchParams
}: {
    params: Promise<{ workspaceId: string }>,
    searchParams: Promise<{ date?: string }>
}) {
    const { workspaceId } = use(params)
    const { date: rawDate } = use(searchParams) // Read date from URL
    const [loading, setLoading] = useState(false)

    // Pre-fill date logic
    const defaultDate = rawDate || ''

    async function onSubmit(formData: FormData) {
        setLoading(true)
        await createEvent(formData, workspaceId)
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href={`/w/${workspaceId}/events`} className="hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Back to Events</Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold">New Event</h1>
                <p className="text-muted-foreground">Schedule a new operation.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <form action={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Name</label>
                        <input name="name" required className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" placeholder="Wedding at Villa..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <input name="location" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" placeholder="123 Main St..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estimated Guests</label>
                        <input name="guestCount" type="number" min="0" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" placeholder="e.g. 150" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date (Required)</label>
                        <input name="date" type="date" required defaultValue={defaultDate} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Time (Optional)</label>
                            <input name="startTime" type="time" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Time (Optional)</label>
                            <input name="endTime" type="time" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
