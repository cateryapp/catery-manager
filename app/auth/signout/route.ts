import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Create a response that redirects
    const url = new URL(request.url)
    return NextResponse.redirect(`${url.origin}/login`, {
        status: 301,
    })
}
