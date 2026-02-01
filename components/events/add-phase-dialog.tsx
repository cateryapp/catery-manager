'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createEventPhase } from '@/app/actions/event-phases'
import { useRouter } from 'next/navigation'

interface AddPhaseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    eventId: string
    phaseTypes: any[]
}

export function AddPhaseDialog({ open, onOpenChange, eventId, phaseTypes }: AddPhaseDialogProps) {
    const [selectedTypeId, setSelectedTypeId] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit() {
        if (!selectedTypeId) return
        setLoading(true)
        const res = await createEventPhase(eventId, selectedTypeId)
        if (res.success) {
            onOpenChange(false)
            setSelectedTypeId('')
            // Router refresh handled by revalidatePath in action? 
            // Ideally we also refresh client state if utilizing router cache, but revalidatePath should suffice.
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Event Phase</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Phase Type</Label>
                        <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a phase type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {phaseTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            Select a phase type from the catalog to add to this event.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!selectedTypeId || loading}>
                        {loading ? 'Adding...' : 'Add Phase'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
