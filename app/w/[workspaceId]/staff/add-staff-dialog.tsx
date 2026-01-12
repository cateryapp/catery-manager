'use client'

import { useState } from 'react'
import { createStaff } from './actions'
import { Plus, Loader2, X } from 'lucide-react'

export default function AddStaffDialog({ workspaceId }: { workspaceId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setLoading(true)
        await createStaff(formData, workspaceId)
        setLoading(false)
        setIsOpen(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add Staff
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl p-6 relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-xl font-bold mb-4">Add New Staff</h2>

                <form action={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <input name="firstName" required className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" placeholder="Jane" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <input name="lastName" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" placeholder="Doe" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role (Default)</label>
                        <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                            <option value="waiter">Waiter</option>
                            <option value="chef">Chef</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="cleaner">Cleaner</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input name="email" type="email" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" placeholder="jane@example.com" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <input name="phone" type="tel" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" placeholder="+34 600 000 000" />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
