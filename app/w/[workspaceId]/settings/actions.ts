'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileLanguage(workspaceId: string, language: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('users')
        .update({ language })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/w/${workspaceId}/settings`)
}
