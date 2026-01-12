'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMoment(formData: FormData) {
    const supabase = await createClient()
    const workspaceId = formData.get('workspace_id') as string
    const eventId = formData.get('event_id') as string
    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const startAt = formData.get('start_at') as string
    const endAt = formData.get('end_at') as string

    // Defaulting logic for simplistic MVP
    const { error } = await supabase
        .from('event_moments')
        .insert({
            workspace_id: workspaceId,
            event_id: eventId,
            type,
            name: name || type, // fallback to type if name empty
            start_at: startAt || null,
            end_at: endAt || null,
            location_mode: 'inherit',
            guest_count_mode: 'inherit'
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/w/${workspaceId}/events/${eventId}`)
}

export async function updateEventDoc(workspaceId: string, eventId: string, content: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('events')
        .update({ doc_content: content })
        .eq('id', eventId)
        .eq('workspace_id', workspaceId)

    if (error) {
        return { error: error.message }
    }

    // No revalidatePath needed for every keystroke usually, but maybe for initial load consistency
}
