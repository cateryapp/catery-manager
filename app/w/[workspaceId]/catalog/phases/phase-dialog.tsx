'use client'

import { useState } from 'react'
import { createPhaseType, updatePhaseType } from '@/app/actions/catalog'
import { X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type PhaseType = {
    id: string
    name: string
    description: string | null
    is_active: boolean
}

interface PhaseDialogProps {
    isOpen: boolean
    onClose: () => void
    phaseToEdit?: PhaseType
}

export function PhaseDialog({ isOpen, onClose, phaseToEdit }: PhaseDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (!isOpen) return null

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        try {
            let res
            if (phaseToEdit) {
                // Determine active state from checkbox if present, or keep existing logic
                // The form should have an input for is_active
                res = await updatePhaseType(phaseToEdit.id, formData)
            } else {
                res = await createPhaseType(formData)
            }

            if (res.success) {
                router.refresh()
                onClose()
            } else {
                alert(res.message)
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background rounded-xl shadow-xl border border-border w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold text-lg">{phaseToEdit ? 'Edit Phase Type' : 'New Phase Type'}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name</label>
                        <input
                            name="name"
                            id="name"
                            required
                            defaultValue={phaseToEdit?.name}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g. Cocktail, Banquet"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
                        <textarea
                            name="description"
                            id="description"
                            defaultValue={phaseToEdit?.description || ''}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Optional description..."
                        />
                    </div>

                    {phaseToEdit && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                defaultChecked={phaseToEdit.is_active}
                                className="h-4 w-4 rounded border-primary text-primary shadow focus:ring-primary"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Active</label>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {phaseToEdit ? 'Save Changes' : 'Create Phase'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
