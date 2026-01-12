import { createClient } from '@/utils/supabase/server'
import { AddMomentDialog } from './add-moment-dialog'
import { MomentCard } from './moment-card'

export default async function EventPlanPage({
    params
}: {
    params: Promise<{ workspaceId: string, eventId: string }>
}) {
    const { workspaceId, eventId } = await params
    const supabase = await createClient()

    // Fetch moments sorted by rank or start_at
    const { data: moments } = await supabase
        .from('event_moments')
        .select('*')
        .eq('event_id', eventId)
        .order('start_at', { ascending: true }) // MVP sorting

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Timeline</h2>
                    <p className="text-muted-foreground">Plan the sequence of events.</p>
                </div>
                <AddMomentDialog workspaceId={workspaceId} eventId={eventId} />
            </div>

            <div className="space-y-0">
                {moments?.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground">No moments added yet. Start planning!</p>
                    </div>
                ) : (
                    moments?.map((moment) => (
                        <MomentCard key={moment.id} moment={moment} />
                    ))
                )}
            </div>
        </div>
    )
}
