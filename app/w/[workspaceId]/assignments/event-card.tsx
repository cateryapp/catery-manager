
import { CalendarDays, Clock, MapPin, Users, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface StaffingStatus {
    role: string
    required: number
    assigned: number
}

interface EventAssignment {
    id: string
    assignmentId?: string
    isAssigned: boolean
    myRole?: string
    status: string
    event: {
        id: string
        name: string
        location: string | null
        start_at: string
        end_at: string | null
        estimated_guests?: number
        staffingStatus: StaffingStatus[]
    }
}

interface Props {
    data: EventAssignment
    selected?: boolean
    onSelect?: () => void
    disabled?: boolean
}

export default function EventAssignmentCard({ data, selected, onSelect, disabled }: Props) {
    const { event, myRole, status } = data

    return (
        <div
            onClick={() => !disabled && onSelect?.()}
            className={cn(
                "relative bg-card border border-border rounded-lg p-4 shadow-sm transition-all text-left",
                !disabled && "cursor-pointer hover:shadow-md",
                selected && "border-primary ring-1 ring-primary bg-primary/5",
                disabled && "opacity-60 cursor-not-allowed bg-secondary/20"
            )}
        >
            {/* Selection Checkmark */}
            {selected && (
                <div className="absolute top-3 right-3 text-primary z-10">
                    <CheckCircle className="w-5 h-5 fill-primary/20" />
                </div>
            )}

            <div className="flex flex-col gap-4">
                {/* Event Info */}
                <div className="space-y-2 flex-1 pr-6">
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-lg leading-tight">{event.name}</span>
                        {/* Only show status badge if we are assigned (or if needed) */}
                        {data.isAssigned && (
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                status === 'confirmed' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                    status === 'completed' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                        "bg-orange-500/10 text-orange-600 border-orange-500/20"
                            )}>
                                {status}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-fit">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {format(new Date(event.start_at), 'EEE, MMM d')}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-fit">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(event.start_at), 'HH:mm')}
                            {event.end_at && ` - ${format(new Date(event.end_at), 'HH:mm')}`}
                        </div>
                        {event.location && (
                            <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                            </div>
                        )}
                        {event.estimated_guests && (
                            <div className="flex items-center gap-1.5 min-w-fit">
                                <Users className="w-3.5 h-3.5" />
                                {event.estimated_guests}
                            </div>
                        )}
                    </div>

                    {data.isAssigned && (
                        <div className="mt-2 text-sm">
                            Role: <span className="font-medium capitalize">{myRole || 'Staff'}</span>
                        </div>
                    )}
                </div>

                {/* Staffing Counters */}
                <div className="flex flex-wrap gap-2">
                    {event.staffingStatus.map((stat) => {
                        const isFull = stat.assigned >= stat.required
                        const percent = Math.min(100, (stat.assigned / (stat.required || 1)) * 100)

                        return (
                            <div key={stat.role} className="flex flex-col items-center bg-secondary/50 rounded-md p-1.5 min-w-[60px] border border-border/50">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">{stat.role}</span>
                                <div className="flex items-baseline gap-0.5">
                                    <span className={cn(
                                        "text-sm font-bold leading-none",
                                        isFull ? "text-green-600" : "text-amber-600"
                                    )}>
                                        {stat.assigned}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">/{stat.required}</span>
                                </div>
                                <div className="w-full h-1 bg-secondary mt-1 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full", isFull ? "bg-green-500" : "bg-amber-500")}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
