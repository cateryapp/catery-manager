'use client'

import { useState } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { EventPhase } from '@/types/event-types'
import { reorderEventPhases } from '@/app/actions/event-phases'
import { PhaseCard } from './phase-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddPhaseDialog } from './add-phase-dialog'
import { PhaseDetailModal } from './phase-detail-modal'

interface EventTimelineProps {
    eventId: string
    initialPhases: EventPhase[]
    phaseTypes: any[] // Passed from server for the add dialog
}

export function EventTimeline({ eventId, initialPhases, phaseTypes }: EventTimelineProps) {
    const [phases, setPhases] = useState<EventPhase[]>(initialPhases)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedPhase, setSelectedPhase] = useState<EventPhase | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setPhases((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id)
                const newIndex = items.findIndex((i) => i.id === over.id)

                const newOrder = arrayMove(items, oldIndex, newIndex)

                // Persist order
                const orderedIds = newOrder.map(p => p.id)
                reorderEventPhases(eventId, orderedIds)

                return newOrder
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Event Timeline</h3>
                <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Phase
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={phases.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {phases.map((phase) => (
                            <PhaseCard
                                key={phase.id}
                                phase={phase}
                                onEdit={() => setSelectedPhase(phase)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <AddPhaseDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                eventId={eventId}
                phaseTypes={phaseTypes}
            />

            <PhaseDetailModal
                phase={selectedPhase}
                open={!!selectedPhase}
                onOpenChange={(open) => !open && setSelectedPhase(null)}
            />
        </div>
    )
}
