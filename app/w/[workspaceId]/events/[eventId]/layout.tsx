import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { MapPin, Calendar, ArrowLeft } from 'lucide-react'

export default async function EventLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ workspaceId: string, eventId: string }>
}) {
    const { workspaceId, eventId } = await params
    const supabase = await createClient()

    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('workspace_id', workspaceId)
        .single()

    if (!event) notFound()

    const tabs = [
        { name: 'Plan', href: `/w/${workspaceId}/events/${eventId}` },
        { name: 'Doc', href: `/w/${workspaceId}/events/${eventId}/doc` },
        { name: 'Staff', href: `/w/${workspaceId}/events/${eventId}/assignments` },
        { name: 'Finance', href: `/w/${workspaceId}/events/${eventId}/payroll` },
    ]

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden ">
            {/* Event Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm p-6 sticky top-0 z-10 shrink-0">
                <div className="mb-4">
                    <Link href={`/w/${workspaceId}/events`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" /> Back to Events
                    </Link>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize border ${event.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                }`}>
                                {event.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(event.start_at), 'PPP p')}</div>
                            {event.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.location}</div>}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 mt-8 -mb-6 border-b border-transparent">
                    {tabs.map(tab => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            // Simplified active state check: usually separate client component for exact matching
                            className="text-sm font-medium pb-4 border-b-2 border-transparent hover:text-primary hover:border-primary/20 transition-all text-muted-foreground focus:outline-none focus:text-primary focus:border-primary"
                        >
                            {tab.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {children}
            </div>
        </div>
    )
}
