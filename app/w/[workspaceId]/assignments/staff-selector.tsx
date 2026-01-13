'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StaffMember {
    id: string
    first_name: string
    last_name: string | null
    email: string | null
    attributes: { role?: string }
}

export default function StaffSelector({
    workspaceId,
    selectedId,
    onSelect
}: {
    workspaceId: string
    selectedId: string | null
    onSelect: (id: string, staff?: StaffMember) => void
}) {
    const [open, setOpen] = useState(false)
    const [staff, setStaff] = useState<StaffMember[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    // Initial fetch or search
    useEffect(() => {
        async function fetchStaff() {
            setLoading(true)
            const supabase = createClient()
            let query = supabase
                .from('staff')
                .select('id, first_name, last_name, email, attributes')
                .eq('workspace_id', workspaceId)
                .order('first_name', { ascending: true })
                .limit(20)

            if (search) {
                // Using the new full_name_search if available, or fallback
                // For safety in dev, let's use ILIKE on first_name for now if migration isn't guaranteed
                query = query.ilike('first_name', `%${search}%`)
            }

            const { data } = await query
            if (data) setStaff(data as any)
            setLoading(false)
        }

        const timer = setTimeout(fetchStaff, 300)
        return () => clearTimeout(timer)
    }, [workspaceId, search])

    const selectedPerson = staff.find(s => s.id === selectedId)

    return (
        <div className="relative w-full max-w-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search staff member..."
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value)
                        setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                />
            </div>

            {open && staff.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-md shadow-md z-10 max-h-60 overflow-auto py-1">
                    {staff.map(s => (
                        <div
                            key={s.id}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                                selectedId === s.id && "bg-accent/50"
                            )}
                            onClick={() => {
                                onSelect(s.id, s)
                                setSearch(`${s.first_name} ${s.last_name || ''}`)
                                setOpen(false)
                            }}
                        >
                            <span>{s.first_name} {s.last_name}</span>
                            {selectedId === s.id && <Check className="w-4 h-4 ml-2" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
