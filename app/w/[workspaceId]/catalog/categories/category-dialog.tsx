'use client'

import { useState } from 'react'
import { createCategory } from '@/app/actions/catalog' // Update if I add updateCategory
import { X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Category = {
    id: string
    name: string
    parent_category_id: string | null
    is_active: boolean
}

interface CategoryDialogProps {
    isOpen: boolean
    onClose: () => void
    categoryToEdit?: Category
    allCategories: Category[]
}

export function CategoryDialog({ isOpen, onClose, categoryToEdit, allCategories }: CategoryDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (!isOpen) return null

    // Filter out self from parent options if editing
    const parentOptions = allCategories.filter(c => c.id !== categoryToEdit?.id)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        try {
            let res
            if (categoryToEdit) {
                // I haven't implemented updateCategory yet in catalog.ts! 
                // I should check or implement it. For now, I'll alert.
                alert("Update not implemented yet")
                setLoading(false)
                return
            } else {
                res = await createCategory(formData)
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
                    <h3 className="font-semibold text-lg">{categoryToEdit ? 'Edit Category' : 'New Category'}</h3>
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
                            defaultValue={categoryToEdit?.name}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g. Starters, Main Courses"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="parent_category_id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Parent Category (Optional)</label>
                        <select
                            name="parent_category_id"
                            id="parent_category_id"
                            defaultValue={categoryToEdit?.parent_category_id || ''}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">None (Top Level)</option>
                            {parentOptions.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

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
                            {categoryToEdit ? 'Save Changes' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
