'use client'

import { useState, useEffect } from 'react'
import { getResources } from '@/app/actions/catalog'
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react'

type Resource = {
    id: string
    name: string
    resource_type: string
    unit: string
    cost_per_unit: number
}

interface ResourceSelectorProps {
    onSelect: (resource: Resource) => void
    excludedIds?: string[]
}

export function ResourceSelector({ onSelect, excludedIds = [] }: ResourceSelectorProps) {
    const [open, setOpen] = useState(false)
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(false)
    const [query, setQuery] = useState('')

    // Fetch all resources once, or search? Resources are usually fewer than products.
    // Let's fetch all on first open.
    const handleOpen = async () => {
        setOpen(!open)
        if (!open && resources.length === 0) {
            setLoading(true)
            try {
                const res = await getResources()
                setResources(res || [])
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const filteredResources = resources.filter(r =>
        !excludedIds.includes(r.id) &&
        r.name.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="relative">
            <div
                className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer bg-background hover:bg-accent/50"
                onClick={handleOpen}
            >
                <span className="text-sm text-muted-foreground">Add a resource...</span>
                <ChevronsUpDown className="w-4 h-4 opacity-50" />
            </div>

            {open && (
                <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-md shadow-md z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center border-b px-3">
                        <Search className="w-4 h-4 mr-2 opacity-50" />
                        <input
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Search resources..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Loading...
                            </div>
                        ) : filteredResources.length === 0 ? (
                            <div className="py-2 px-2 text-sm text-muted-foreground text-center">No resources found.</div>
                        ) : (
                            filteredResources.map(resource => (
                                <div
                                    key={resource.id}
                                    className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                    onClick={() => {
                                        onSelect(resource)
                                        setOpen(false)
                                        setQuery('')
                                    }}
                                >
                                    <span className="font-medium">{resource.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {resource.cost_per_unit} / {resource.unit}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {open && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpen(false)} />}
        </div>
    )
}
