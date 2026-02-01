'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResponse = {
    success: boolean
    message: string
    data?: any
    error?: any
}

// Helper to get workspace_id (copied from catalog actions, crucial for RLS)
async function getWorkspaceId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: members } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

    if (!members) throw new Error('No workspace found')
    return members.workspace_id
}

export async function getEventPhases(eventId: string) {
    const supabase = await createClient()

    // Fetch phases with type info and items count
    const { data, error } = await supabase
        .from('event_phases')
        .select(`
            *,
            phase_type:phase_types(name),
            items:event_phase_items(count)
        `)
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function createEventPhase(eventId: string, phaseTypeId: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        // Get max sort order to append
        const { data: maxSort } = await supabase
            .from('event_phases')
            .select('sort_order')
            .eq('event_id', eventId)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single()

        const sort_order = (maxSort?.sort_order ?? 0) + 1

        const { error } = await supabase.from('event_phases').insert({
            workspace_id,
            event_id: eventId,
            phase_type_id: phaseTypeId,
            sort_order
        })

        if (error) throw error
        revalidatePath(`/w/${workspace_id}/events/${eventId}`)
        return { success: true, message: 'Phase added' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function reorderEventPhases(eventId: string, orderedIds: string[]): Promise<ActionResponse> {
    try {
        const supabase = await createClient()

        // Prepare updates
        const updates = orderedIds.map((id, index) => ({
            id,
            sort_order: index + 1
        }))

        // Upsert allows updating by ID. 
        // Note: RLS requires workspace_id usually? 
        // If we just update 'start_order', we might need to be careful with other constrained fields if we use upsert.
        // Actually, supabase JS upsert works if we provide all required fields OR if we just perform multiple updates.
        // Multiple updates is safer for partial update usually, but slower.
        // Let's use RPC if possible, or simple loop for now (not atomic but okay for MVP).
        // Or better: upsert with just ID and sort_order if we ignore constraints? No, not nulls will fail.

        // We will loop update. For 10-20 phases it's fine.
        for (const update of updates) {
            await supabase
                .from('event_phases')
                .update({ sort_order: update.sort_order })
                .eq('id', update.id)
        }

        revalidatePath(`/events/${eventId}`) // We don't have workspaceId easily here without fetch, assumes broad revalidation or we can just fetch it.
        return { success: true, message: 'Order updated' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function updateEventPhase(phaseId: string, data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('event_phases')
            .update({
                name_override: data.name_override
            })
            .eq('id', phaseId)

        if (error) throw error
        // Revalidation path is tricky without workspace/event ID.
        // We can return success and let client router refresh.
        return { success: true, message: 'Phase updated' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function deleteEventPhase(phaseId: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('event_phases').delete().eq('id', phaseId)
        if (error) throw error
        return { success: true, message: 'Phase deleted' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}
