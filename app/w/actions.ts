'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createWorkspace(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Create Workspace
    const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({ name })
        .select()
        .single()

    if (wsError) {
        return { error: wsError.message }
    }

    // 2. Add creator as Owner -> Handled by DB Trigger

    redirect(`/w/${workspace.id}`)

    redirect(`/w/${workspace.id}`)
}
