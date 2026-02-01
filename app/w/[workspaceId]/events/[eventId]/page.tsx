import { createClient } from '@/utils/supabase/server'
import { getEventPhases } from '@/app/actions/event-phases'
import { getPhaseTypes } from '@/app/actions/catalog'
import { EventTimeline } from '@/components/events/event-timeline'

export default async function EventPlanPage({
    params
}: {
    params: Promise<{ workspaceId: string, eventId: string }>
}) {
    const { workspaceId, eventId } = await params

    // Fetch data in parallel
    const [phases, phaseTypes] = await Promise.all([
        getEventPhases(eventId),
        getPhaseTypes()
    ])

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Event Timeline</h2>
                    <p className="text-muted-foreground">Plan the sequence of phases and assign products.</p>
                </div>
            </div>

            <EventTimeline
                eventId={eventId}
                initialPhases={phases}
                phaseTypes={phaseTypes || []}
            />
        </div>
    )
}
