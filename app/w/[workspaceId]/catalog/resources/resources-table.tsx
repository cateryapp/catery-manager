'use client'

import { useState } from 'react'
import { ResourceDialog } from './resource-dialog'
import { Edit2, Plus, Trash2, Archive } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Resource = {
    id: string
    name: string
    resource_type: string
    unit: string
    cost_per_unit: number
    is_reusable: boolean
    is_active: boolean
    workspace_id: string
}

export function ResourcesTable({ resources }: { resources: Resource[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [resourceToEdit, setResourceToEdit] = useState<Resource | undefined>(undefined)
    const router = useRouter()

    const handleCreate = () => {
        setResourceToEdit(undefined)
        setIsDialogOpen(true)
    }

    const handleEdit = (resource: Resource) => {
        setResourceToEdit(resource)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this resource?')) {
            // await deleteResource(id) // Implement deleteResource
            alert("Delete not implemented yet")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Resource
                </button>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Unit</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Cost</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px]">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {resources.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground h-24">
                                        No resources found. Define ingredients, staff, or equipment here.
                                    </td>
                                </tr>
                            ) : resources.map((resource) => (
                                <tr key={resource.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{resource.name}</td>
                                    <td className="p-4 align-middle capitalize">{resource.resource_type}</td>
                                    <td className="p-4 align-middle text-muted-foreground">{resource.unit}</td>
                                    <td className="p-4 align-middle text-right font-mono">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(resource.cost_per_unit)}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${resource.is_active ? 'border-transparent bg-green-100 text-green-800' : 'border-transparent bg-gray-100 text-gray-800'}`}>
                                            {resource.is_active ? 'Active' : 'Archived'}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(resource)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(resource.id)}
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

            <ResourceDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                resourceToEdit={resourceToEdit}
            />
        </div>
    )
}
