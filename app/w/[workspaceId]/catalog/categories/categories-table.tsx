'use client'

import { useState } from 'react'
import { CategoryDialog } from './category-dialog'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Category = {
    id: string
    name: string
    parent_category_id: string | null
    is_active: boolean
    workspace_id: string
}

export function CategoriesTable({ categories }: { categories: Category[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined)
    const router = useRouter()

    const handleCreate = () => {
        setCategoryToEdit(undefined)
        setIsDialogOpen(true)
    }

    const handleEdit = (category: Category) => {
        setCategoryToEdit(category)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category? Features and products might be affected.')) {
            // await deleteCategory(id) // Not implemented yet
            alert("Delete not implemented yet")
        }
    }

    // Identify parent names
    const getParentName = (parentId: string | null) => {
        if (!parentId) return '-'
        return categories.find(c => c.id === parentId)?.name || 'Unknown'
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Parent Category</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-muted-foreground h-24">
                                        No categories found. Create one to get started.
                                    </td>
                                </tr>
                            ) : categories.map((category) => (
                                <tr key={category.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{category.name}</td>
                                    <td className="p-4 align-middle text-muted-foreground">{getParentName(category.parent_category_id)}</td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-red-50 hover:text-red-600 h-8 w-8"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                categoryToEdit={categoryToEdit}
                allCategories={categories}
            />
        </div>
    )
}
