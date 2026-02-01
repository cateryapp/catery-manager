'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Edit2 } from 'lucide-react'
import { EventPhase } from '@/types/event-types'
import { cn } from '@/utils/cn'

interface PhaseCardProps {
    phase: EventPhase
    onEdit: () => void
}

export function PhaseCard({ phase, onEdit }: PhaseCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: phase.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
    }

    return (
        <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50")}>
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                    <div {...attributes} {...listeners} className="cursor-grab hover:text-primary">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                        <h4 className="font-medium text-base">
                            {phase.name_override || phase.phase_type?.name || 'Unnamed Phase'}
                        </h4>
                        <div className="text-sm text-muted-foreground flex gap-4">
                            <span>{phase.phase_type?.name}</span>
                            <span>•</span>
                            <span>{phase.items_count || 0} items</span>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={onEdit}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
