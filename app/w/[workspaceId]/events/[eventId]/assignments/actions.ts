'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAssignment(formData: FormData, eventId: string, workspaceId: string) {
    const supabase = await createClient()

    const staffId = formData.get('staffId') as string
    const role = formData.get('role') as string
    const startAt = formData.get('startAt') as string // optional override

    const { error } = await supabase
        .from('assignments')
        .insert({
            workspace_id: workspaceId,
            event_id: eventId,
            staff_id: staffId,
            role,
            status: 'pending'
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/w/${workspaceId}/events/${eventId}/assignments`)
    revalidatePath(`/w/${workspaceId}/events/${eventId}`) // update overview stats
    return { success: true }
}

export async function removeAssignment(assignmentId: string, path: string) {
    const supabase = await createClient()

    await supabase.from('assignments').delete().eq('id', assignmentId)

    revalidatePath(path)
}
