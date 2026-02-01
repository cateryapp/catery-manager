'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { getDateFnsLocale } from '@/utils/date-locales'

export function EventsCalendar({
    workspaceId,
    events,
    currentDate,
    lang = 'en'
}: {
    workspaceId: string,
    events: any[],
    currentDate: Date,
    lang?: string,
    dict?: any
}) {
    const router = useRouter()
    const locale = getDateFnsLocale(lang)

    // Calendar Generation Logic
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    // Generate localized weekday headers
    // We take a representative week (e.g. the first week of the calendar view)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 1 })
    }).map(day => format(day, 'EEE', { locale }))

    const handlePrevMonth = () => {
        const newDate = subMonths(currentDate, 1)
        router.push(`?view=calendar&month=${format(newDate, 'yyyy-MM')}`)
    }

    const handleNextMonth = () => {
        const newDate = addMonths(currentDate, 1)
        router.push(`?view=calendar&month=${format(newDate, 'yyyy-MM')}`)
    }

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale })}
                    </h2>
                    <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-secondary"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="w-px h-full bg-border"></div>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-secondary"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
                {/* View toggle handled by parent Page, but can link to 'List' view here too if desired */}
            </div>

            {/* Grid */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
                    {weekDays.map(day => (
                        <div key={day} className="p-3 text-sm font-medium text-center text-muted-foreground border-r border-border last:border-r-0 capitalize">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 auto-rows-[140px]">
                    {days.map((day, idx) => {
                        // Filter events for this day
                        const dayEvents = events.filter(e => isSameDay(new Date(e.start_at), day))
                        const isCurrentMonth = isSameMonth(day, monthStart)
                        const isToday = isSameDay(day, new Date())

                        // Construct "New Event" URL
                        const newEventUrl = `/w/${workspaceId}/events/new?date=${format(day, 'yyyy-MM-dd')}`

                        return (
                            <div
                                key={day.toISOString()}
                                onClick={() => router.push(newEventUrl)}
                                className={`
                                    relative p-2 border-b border-r border-border last:border-r-0 
                                    hover:bg-secondary/20 transition-colors group cursor-pointer
                                    ${!isCurrentMonth ? 'bg-secondary/10 text-muted-foreground/50' : ''}
                                    ${isToday ? 'bg-primary/5' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${isToday ? 'bg-primary text-primary-foreground' : ''}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    {/* Plus icon on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-secondary rounded-full">
                                        <Plus className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-1 overflow-y-auto max-h-[90px] no-rollbar">
                                    {dayEvents.map(event => (
                                        <Link
                                            key={event.id}
                                            href={`/w/${workspaceId}/events/${event.id}`}
                                            onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
                                            className="block text-xs truncate px-2 py-1 rounded-md bg-secondary/80 border border-transparent hover:border-primary/50 hover:bg-secondary text-foreground"
                                        >
                                            <span className={`w-1.5 h-1.5 inline-block rounded-full mr-1.5 ${event.status === 'confirmed' ? 'bg-green-500' :
                                                event.status === 'done' ? 'bg-blue-500' : 'bg-yellow-500'
                                                }`}></span>
                                            {event.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
