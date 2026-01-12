import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, List, Calendar as CalendarIcon } from 'lucide-react'
import { EventsList } from './events-list'
import { EventsCalendar } from './events-calendar'
import { parseISO } from 'date-fns'

export default async function EventsPage({
    params,
    searchParams
}: {
    params: Promise<{ workspaceId: string }>
    searchParams: Promise<{ view?: string, month?: string }>
}) {
    const { workspaceId } = await params
    const { view = 'calendar', month } = await searchParams
    const supabase = await createClient()

    // Fetch user language
    const { data: { user } } = await supabase.auth.getUser()
    let lang = 'en';
    if (user) {
        const { data: profile } = await supabase.from('users').select('language').eq('id', user.id).single();
        if (profile?.language) lang = profile.language;
    }

    // Import dictionary for Server Component
    // We can dynamically require it, or since we have few, just import the helper
    // For simplicity in this file without async helper overhead if possible, but helper is clean.
    // Actually, let's use the helper I just made.
    const { getDictionary } = await import('@/utils/get-dictionary')
    const dict = await getDictionary(lang)

    // Determine current date for calendar
    const currentDate = month ? parseISO(`${month}-01`) : new Date()

    // Fetch Events 
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('start_at', { ascending: true })

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{dict.events.title}</h1>
                    <p className="text-muted-foreground">{dict.events.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggles */}
                    <div className="flex items-center bg-card border border-border rounded-lg p-1">
                        <Link
                            href={`?view=calendar${month ? `&month=${month}` : ''}`}
                            className={`p-2 rounded-md transition-colors ${view === 'calendar' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                        </Link>
                        <Link
                            href={`?view=list${month ? `&month=${month}` : ''}`}
                            className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <List className="w-4 h-4" />
                        </Link>
                    </div>

                    <Link
                        href={`/w/${workspaceId}/events/new`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {dict.events.create_button}
                    </Link>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {view === 'calendar' ? (
                    <EventsCalendar
                        workspaceId={workspaceId}
                        events={events || []}
                        currentDate={currentDate}
                        dict={dict}
                    />
                ) : (
                    <EventsList
                        workspaceId={workspaceId}
                        events={events || []}
                        dict={dict}
                    />
                )}
            </div>
        </div>
    )
}
