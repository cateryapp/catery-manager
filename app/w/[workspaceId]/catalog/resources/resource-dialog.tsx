'use client'

import { useState } from 'react'
import { createResource, updateResource } from '@/app/actions/catalog'
import { X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Resource = {
    id: string
    name: string
    resource_type: string
    unit: string
    cost_per_unit: number
    is_reusable: boolean
    is_active: boolean
}

interface ResourceDialogProps {
    isOpen: boolean
    onClose: () => void
    resourceToEdit?: Resource
}

export function ResourceDialog({ isOpen, onClose, resourceToEdit }: ResourceDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (!isOpen) return null

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        // Convert checkbox to boolean explicitely or handle in action if undefined
        // My action expects raw form data, usually checkboxes are 'on' or missing.
        // It's safer to construct an object if the action expects it, but let's check catalog.ts
        // createResource takes FormData. updateResource takes (id, object). 
        // Wait, typical inconsistency. Let's check catalog.ts.

        try {
            let res
            if (resourceToEdit) {
                // updateResource signature: (id: string, data: any)
                const data = {
                    name: formData.get('name'),
                    resource_type: formData.get('resource_type'),
                    unit: formData.get('unit'),
                    cost_per_unit: parseFloat(formData.get('cost_per_unit') as string),
                    is_reusable: formData.get('is_reusable') === 'on',
                    is_active: formData.get('is_active') === 'on'
                }
                res = await updateResource(resourceToEdit.id, data)
            } else {
                // createResource signature: (formData: FormData)
                res = await createResource(formData)
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
                    <h3 className="font-semibold text-lg">{resourceToEdit ? 'Edit Resource' : 'New Resource'}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                            name="name"
                            required
                            defaultValue={resourceToEdit?.name}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g. Waiter, Chair, Salmon"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                name="resource_type"
                                required
                                defaultValue={resourceToEdit?.resource_type || 'material'}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="material">Material / Ingredient</option>
                                <option value="labor">Labor / Staff</option>
                                <option value="equipment">Equipment</option>
                                <option value="venue">Venue / Space</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Unit</label>
                            <input
                                name="unit"
                                required
                                defaultValue={resourceToEdit?.unit || 'pcs'}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="e.g. kg, hour"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cost per Unit</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <input
                                type="number"
                                name="cost_per_unit"
                                required
                                step="0.01"
                                defaultValue={resourceToEdit?.cost_per_unit}
                                className="flex h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            name="is_reusable"
                            id="is_reusable"
                            defaultChecked={resourceToEdit?.is_reusable ?? false}
                            className="h-4 w-4 rounded border-primary text-primary shadow focus:ring-primary"
                        />
                        <label htmlFor="is_reusable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Reusable (Equipment/Staff)
                        </label>
                    </div>

                    {resourceToEdit && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                defaultChecked={resourceToEdit.is_active}
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
                            {resourceToEdit ? 'Save Changes' : 'Create Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
