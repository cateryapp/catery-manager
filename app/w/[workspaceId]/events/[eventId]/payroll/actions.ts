'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePayroll(payload: { id: string, net_amount: number }[], eventId: string, workspaceId: string) {
    const supabase = await createClient()

    // In a real app we might want a transaction or single update per row loop
    // For MVP, we'll iterate.
    for (const item of payload) {
        const { error } = await supabase
            .from('assignments')
            .update({ net_amount: item.net_amount })
            .eq('id', item.id)

        if (error) {
            console.error("Error updating payroll", error)
            return { error: error.message }
        }
    }

    revalidatePath(`/w/${workspaceId}/events/${eventId}/payroll`)
    return { success: true }
}
