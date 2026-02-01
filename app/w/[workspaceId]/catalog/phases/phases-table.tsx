'use client'

import { useState } from 'react'
import { PhaseDialog } from './phase-dialog'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { deletePhaseType } from '@/app/actions/catalog'
import { useRouter } from 'next/navigation'

type PhaseType = {
    id: string
    name: string
    description: string | null
    is_active: boolean
    workspace_id: string
}

export function PhasesTable({ phases }: { phases: PhaseType[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [phaseToEdit, setPhaseToEdit] = useState<PhaseType | undefined>(undefined)
    const router = useRouter()

    const handleCreate = () => {
        setPhaseToEdit(undefined)
        setIsDialogOpen(true)
    }

    const handleEdit = (phase: PhaseType) => {
        setPhaseToEdit(phase)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this phase type?')) {
            await deletePhaseType(id)
            router.refresh()
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
                    Add Phase Type
                </button>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Description</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px]">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {phases.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground h-24">
                                        No phase types found. Create one to get started.
                                    </td>
                                </tr>
                            ) : phases.map((phase) => (
                                <tr key={phase.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{phase.name}</td>
                                    <td className="p-4 align-middle text-muted-foreground">{phase.description}</td>
                                    <td className="p-4 align-middle">
                                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${phase.is_active ? 'border-transparent bg-green-100 text-green-800' : 'border-transparent bg-gray-100 text-gray-800'}`}>
                                            {phase.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(phase)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(phase.id)}
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

            <PhaseDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                phaseToEdit={phaseToEdit}
            />
        </div>
    )
}
