'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Check, ChevronsUpDown, Search, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface EventOption {
    id: string
    name: string
    start_at: string
}

export default function EventSelector({
    workspaceId,
    selectedId,
    onSelect
}: {
    workspaceId: string
    selectedId: string | null
    onSelect: (id: string) => void
}) {
    const [open, setOpen] = useState(false)
    const [events, setEvents] = useState<EventOption[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    // Initial fetch or search
    useEffect(() => {
        async function fetchEvents() {
            setLoading(true)
            const supabase = createClient()
            let query = supabase
                .from('events')
                .select('id, name, start_at')
                .eq('workspace_id', workspaceId)
                .gte('start_at', new Date().toISOString()) // Only future events
                .order('start_at', { ascending: true })
                .limit(20)

            if (search) {
                query = query.ilike('name', `%${search}%`)
            }

            const { data } = await query
            if (data) setEvents(data)
            setLoading(false)
        }

        const timer = setTimeout(fetchEvents, 300)
        return () => clearTimeout(timer)
    }, [workspaceId, search])

    const selectedEvent = events.find(e => e.id === selectedId)

    return (
        <div className="relative w-full max-w-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search upcoming event..."
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value)
                        setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                />
            </div>

            {open && events.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-md shadow-md z-10 max-h-60 overflow-auto py-1">
                    {events.map(e => (
                        <div
                            key={e.id}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                                selectedId === e.id && "bg-accent/50"
                            )}
                            onClick={() => {
                                onSelect(e.id)
                                setSearch(e.name)
                                setOpen(false)
                            }}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium">{e.name}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" />
                                    {format(new Date(e.start_at), 'MMM d, HH:mm')}
                                </span>
                            </div>
                            {selectedId === e.id && <Check className="w-4 h-4 ml-2" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
