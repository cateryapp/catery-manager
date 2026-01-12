'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData, workspaceId: string) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const location = formData.get('location') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const guestCount = formData.get('guestCount') as string
    const status = 'draft'

    // Construct timestamps
    // If no time provided, default to 00:00:00 locally? Or UTC? 
    // Ideally we treat "Event Date" as a semantic day, but DB stores timestamptz. 
    // We'll append 'T00:00:00' if time missing.

    const startIso = startTime ? `${date}T${startTime}:00` : `${date}T00:00:00`
    const endIso = endTime ? `${date}T${endTime}:00` : null // End date assumed same day for MVP creation, or nullable

    const { data: event, error } = await supabase
        .from('events')
        .insert({
            workspace_id: workspaceId,
            name,
            location,
            start_at: new Date(startIso).toISOString(),
            end_at: endIso ? new Date(endIso).toISOString() : null,
            default_guest_count: guestCount ? parseInt(guestCount) : 0,
            status
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    redirect(`/w/${workspaceId}/events/${event.id}`)
}
