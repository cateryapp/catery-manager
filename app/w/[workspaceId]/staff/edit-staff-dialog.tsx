'use client'

import { useState } from 'react'
import { updateStaff } from './actions'
import { Pencil, Loader2, X, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EditStaffDialog({
    workspaceId,
    staff
}: {
    workspaceId: string
    staff: any
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setLoading(true)
        await updateStaff(formData, workspaceId, staff.id)
        setLoading(false)
        setIsOpen(false)
        router.refresh()
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-secondary transition-colors"
            >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
            </button>
        )
    }

    const currentRole = staff.attributes?.role || 'waiter'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl p-6 relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                </button>

                <h2 className="text-xl font-bold mb-4">Edit Staff Profile</h2>

                <form action={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <input
                                name="firstName"
                                required
                                defaultValue={staff.first_name}
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <input
                                name="lastName"
                                defaultValue={staff.last_name}
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <select
                            name="role"
                            defaultValue={currentRole}
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                        >
                            <option value="waiter">Waiter</option>
                            <option value="chef">Chef</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="cleaner">Cleaner</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            name="email"
                            type="email"
                            defaultValue={staff.email}
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <input
                            name="phone"
                            type="tel"
                            defaultValue={staff.phone}
                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm flex items-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
