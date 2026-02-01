import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run Supabase code during static generation
    // CONSTANTLY refreshing the session to ensure the server component has a valid session
    try {
        const { error } = await supabase.auth.getUser()

        if (error) {
            // Only clear cookies if it's strictly a session issue
            if (error.code === 'refresh_token_not_found' || error.status === 400) {
                // Clear all Supabase cookies to force re-login
                const cookiesToClear = request.cookies.getAll().filter(c => c.name.startsWith('sb-'))
                cookiesToClear.forEach(c => {
                    request.cookies.delete(c.name)
                    supabaseResponse.cookies.delete(c.name)
                })
            }
        }
    } catch (e) {
        // Catch any unexpected errors to prevent crashing
        console.error("Middleware Auth Exception:", e)
        // Force clear cookies on exception too
        const cookiesToClear = request.cookies.getAll().filter(c => c.name.startsWith('sb-'))
        cookiesToClear.forEach(c => {
            request.cookies.delete(c.name)
            supabaseResponse.cookies.delete(c.name)
        })
    }

    // protected routes logic can go here later
    return supabaseResponse
}
