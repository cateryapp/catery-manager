import Link from 'next/link'
import { Plus, Calendar, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { getDateFnsLocale } from '@/utils/date-locales'

export function EventsList({
    workspaceId,
    events,
    lang = 'en',
    dict
}: {
    workspaceId: string,
    events: any[],
    lang?: string,
    dict?: any
}) {
    const locale = getDateFnsLocale(lang)

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {events?.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-xl border border-border">
                        <p className="text-muted-foreground">{dict?.events?.no_events || 'No events found.'}</p>
                    </div>
                )}

                {events?.map((event) => (
                    <Link
                        key={event.id}
                        href={`/w/${workspaceId}/events/${event.id}`}
                        className="group block p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                        {event.name}
                                    </h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize border ${event.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        event.status === 'done' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                        {dict?.events?.status?.[event.status] || event.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(event.start_at), 'PPP p', { locale })}
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {event.location}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Snapshot stats placeholders */}
                            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex flex-col items-end">
                                    <span className="flex items-center gap-1 text-foreground font-medium"><Users className="w-3 h-3" /> {event.default_guest_count || 0}</span>
                                    <span className="text-xs">{dict?.events?.form?.guests_label?.split(' ')?.[1] || 'Guests'}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
