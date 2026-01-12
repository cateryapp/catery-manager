'use client'

import { useState } from 'react'
import { Plus, Coffee, Users, Utensils, Music, Mic, Check } from 'lucide-react'
import { createMoment } from './actions'

const MOMENT_TYPES = [
    { value: 'meeting', label: 'Meeting', icon: Users },
    { value: 'ceremony', label: 'Ceremony', icon: Check },
    { value: 'coffee_break', label: 'Coffee Break', icon: Coffee },
    { value: 'lunch', label: 'Lunch', icon: Utensils },
    { value: 'cocktail', label: 'Cocktail', icon: Music },
    { value: 'dinner', label: 'Dinner', icon: Utensils },
    { value: 'party', label: 'Party', icon: Music },
]

export function AddMomentDialog({ workspaceId, eventId }: { workspaceId: string, eventId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setLoading(true)
        await createMoment(formData)
        setLoading(false)
        setIsOpen(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-white/90 transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4" /> Add Moment
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-xl border border-border p-6 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Add Moment</h2>
                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <form action={onSubmit} className="space-y-4">
                    <input type="hidden" name="workspace_id" value={workspaceId} />
                    <input type="hidden" name="event_id" value={eventId} />

                    <div className="grid grid-cols-3 gap-3">
                        {MOMENT_TYPES.map(t => (
                            <label key={t.value} className="cursor-pointer group">
                                <input type="radio" name="type" value={t.value} className="peer sr-only" required />
                                <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-secondary/50 peer-checked:border-primary peer-checked:bg-primary/10 transition-all hover:bg-secondary">
                                    <t.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground peer-checked:text-primary" />
                                    <span className="text-xs font-medium">{t.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name (Optional)</label>
                        <input name="name" placeholder="e.g. Welcome Drinks" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Time</label>
                            <input name="start_at" type="time" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Time</label>
                            <input name="end_at" type="time" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium">
                        {loading ? 'Creating...' : 'Create Moment'}
                    </button>
                </form>
            </div>
        </div>
    )
}
