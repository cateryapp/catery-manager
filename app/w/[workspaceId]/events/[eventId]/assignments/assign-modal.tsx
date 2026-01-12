'use client'

import { useState } from 'react'
import { createAssignment } from './actions'
import { Plus, X, Loader2, Search } from 'lucide-react'

export default function AssignStaffModal({
    workspaceId,
    eventId,
    staffList
}: {
    workspaceId: string,
    eventId: string,
    staffList: any[]
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null)

    const filteredStaff = staffList.filter(s =>
        s.first_name.toLowerCase().includes(search.toLowerCase()) ||
        s.last_name?.toLowerCase().includes(search.toLowerCase())
    )

    async function onSubmit(formData: FormData) {
        if (!selectedStaff) return
        setLoading(true)
        formData.set('staffId', selectedStaff) // enforce selected ID
        await createAssignment(formData, eventId, workspaceId)
        setLoading(false)
        setIsOpen(false)
        setSelectedStaff(null)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Assign Staff
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-xl font-bold mb-4">Assign Staff</h2>

                <form action={onSubmit} className="space-y-4 flex-1 flex flex-col overflow-hidden">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Staff</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="pl-9 h-10 w-full rounded-md border border-input bg-background/50 text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="border border-border rounded-md h-48 overflow-y-auto bg-background/30 p-1 space-y-1">
                            {filteredStaff.map(staff => (
                                <div
                                    key={staff.id}
                                    onClick={() => setSelectedStaff(staff.id)}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-colors ${selectedStaff === staff.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                                >
                                    <div className="font-medium">{staff.first_name} {staff.last_name}</div>
                                    <div className={`text-xs ${selectedStaff === staff.id ? 'text-primary-foreground/70' : 'text-muted-foreground capitalize'}`}>
                                        {(staff.attributes as any)?.role}
                                    </div>
                                </div>
                            ))}
                            {filteredStaff.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground text-xs">No matching staff found.</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role for Event</label>
                        <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                            <option value="waiter">Waiter</option>
                            <option value="barman">Barman</option>
                            <option value="chef">Chef</option>
                            <option value="support">Support</option>
                        </select>
                    </div>

                    <div className="pt-2 flex justify-end gap-2 mt-auto">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading || !selectedStaff}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Assign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
