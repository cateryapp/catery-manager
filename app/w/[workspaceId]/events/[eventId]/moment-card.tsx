import { format } from 'date-fns'
import { Users, MapPin, Clock } from 'lucide-react'

// Simple helper to check if inherit
const isInherit = (mode: string) => mode === 'inherit'

export function MomentCard({ moment }: { moment: any }) {
    return (
        <div className="group relative flex gap-6">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-8 bottom-[-24px] w-px bg-border group-last:hidden"></div>

            {/* Icon/Time */}
            <div className="flex flex-col items-center gap-2 shrink-0 w-10">
                <div className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center shadow-sm z-10 group-hover:border-primary/50 transition-colors">
                    {/* Placeholder icon logic based on type could go here */}
                    <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                {moment.start_at && (
                    <span className="text-xs font-mono text-muted-foreground">
                        {moment.start_at}
                    </span>
                )}
            </div>

            {/* Card Content */}
            <div className="flex-1 bg-card border border-border rounded-xl p-5 mb-6 hover:border-white/20 transition-colors cursor-pointer shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{moment.type.replace('_', ' ')}</span>
                        </div>
                        <h3 className="text-lg font-bold">{moment.name}</h3>
                    </div>
                    {/* Status or Actions */}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                            {isInherit(moment.guest_count_mode) ?
                                <span className="opacity-50">Inherited</span> :
                                <span className="text-foreground">{moment.guest_count_override}</span>
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                            {isInherit(moment.location_mode) ?
                                <span className="opacity-50">Inherited</span> :
                                <span className="text-foreground">{moment.location_override}</span>
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
