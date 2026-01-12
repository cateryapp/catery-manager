import { createClient } from '@/utils/supabase/server'
import { EventEditor } from '../event-editor'

export default async function EventDocPage({
    params
}: {
    params: Promise<{ workspaceId: string, eventId: string }>
}) {
    const { workspaceId, eventId } = await params
    const supabase = await createClient()

    // Fetch event doc content
    const { data: event } = await supabase
        .from('events')
        .select('doc_content')
        .eq('id', eventId)
        .single()

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div>
                <h2 className="text-xl font-bold">Event Notes</h2>
                <p className="text-muted-foreground">Operational details, meeting minutes, and flexible requirements.</p>
            </div>

            <EventEditor
                workspaceId={workspaceId}
                eventId={eventId}
                initialContent={event?.doc_content}
            />
        </div>
    )
}
