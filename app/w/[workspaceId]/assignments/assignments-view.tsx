'use client'

import { useState, useEffect } from 'react'
import { getStaffAssignmentBoardData, getEventAssignmentData, bulkAssignStaff, bulkUnassignStaff } from './actions'
import StaffSelector from './staff-selector'
import EventSelector from './event-selector'
import EventAssignmentsPanel from './event-assignments-panel'
import EventAssignmentCard from './event-card'
import { Calendar, User, ArrowRight, Trash2, PlusCircle, Check, X, ShieldCheck, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'


export default function AssignmentsView({ workspaceId }: { workspaceId: string }) {
    const [mode, setMode] = useState<'person' | 'event'>('person')
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
    const [selectedStaff, setSelectedStaff] = useState<any>(null)

    // By Event State
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
    const [eventData, setEventData] = useState<any>(null)

    // Data
    const [assignedEvents, setAssignedEvents] = useState<any[]>([])
    const [availableEvents, setAvailableEvents] = useState<any[]>([])
    const [roles, setRoles] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    // Selection State
    const [selectedAvailableIds, setSelectedAvailableIds] = useState<Set<string>>(new Set())
    const [selectedAssignedIds, setSelectedAssignedIds] = useState<Set<string>>(new Set())

    // Processing State
    const [processing, setProcessing] = useState(false)

    const refreshData = async () => {
        setLoading(true)
        if (mode === 'person' && selectedStaffId) {
            const data = await getStaffAssignmentBoardData(workspaceId, selectedStaffId)
            setAssignedEvents(data.assignedEvents)
            setAvailableEvents(data.availableEvents)
            setRoles(data.roles || [])
        } else if (mode === 'event' && selectedEventId) {
            const data = await getEventAssignmentData(workspaceId, selectedEventId)
            setEventData(data)
            setRoles(data?.roles || [])
        }
        setLoading(false)

        // Clear selections on refresh
        setSelectedAvailableIds(new Set())
        setSelectedAssignedIds(new Set())
    }

    useEffect(() => {
        if ((mode === 'person' && selectedStaffId) || (mode === 'event' && selectedEventId)) {
            refreshData()
        }
    }, [selectedStaffId, selectedEventId, mode, workspaceId])

    // Toggle logic
    const toggleAvailable = (id: string) => {
        const next = new Set(selectedAvailableIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedAvailableIds(next)
    }

    const toggleAssigned = (id: string) => {
        const next = new Set(selectedAssignedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedAssignedIds(next)
    }

    // Actions
    const handleAssign = async (role: string) => {
        if (selectedAvailableIds.size === 0 || !selectedStaffId) return
        setProcessing(true)
        try {
            await bulkAssignStaff(workspaceId, selectedStaffId, Array.from(selectedAvailableIds), role)
            await refreshData() // Refresh to move cards
        } catch (e) {
            console.error(e)
            alert('Failed to assign staff')
        }
        setProcessing(false)
    }

    const handleUnassign = async () => {
        if (selectedAssignedIds.size === 0) return
        if (!confirm(`Unassign staff from ${selectedAssignedIds.size} events?`)) return

        setProcessing(true)
        // map event IDs to assignment IDs (we need to find the assignment ID for the selected event)
        // Luckily our assignedEvents objects have assignmentId
        const assignmentIds = Array.from(selectedAssignedIds)
            .map(eventId => assignedEvents.find(e => e.id === eventId)?.assignmentId)
            .filter(Boolean) as string[]

        try {
            await bulkUnassignStaff(workspaceId, assignmentIds)
            await refreshData()
        } catch (e) {
            console.error(e)
            alert('Failed to unassign staff')
        }
        setProcessing(false)
    }

    return (
        <div className="space-y-6">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg w-fit border border-border">
                <button
                    onClick={() => setMode('person')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                        mode === 'person' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <User className="w-4 h-4" />
                    By Person
                </button>
                <button
                    onClick={() => setMode('event')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                        mode === 'event' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Calendar className="w-4 h-4" />
                    By Event
                </button>
            </div>

            {mode === 'person' && (
                <div className="space-y-8">
                    {/* 1. Selector */}
                    <div className="max-w-md">
                        <label className="text-sm font-medium mb-1.5 block">Select Staff Member</label>
                        <StaffSelector
                            workspaceId={workspaceId}
                            selectedId={selectedStaffId}
                            onSelect={(id, staff) => {
                                setSelectedStaffId(id)
                                setSelectedStaff(staff)
                            }}
                        />
                    </div>

                    {!selectedStaffId ? (
                        <div className="text-center py-20 border border-dashed rounded-xl bg-secondary/5 text-muted-foreground">
                            <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>Select a person to manage their assignments.</p>
                        </div>
                    ) : (
                        <>
                            {/* 2. Assigned Events (Grid) */}
                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        Assigned Schedule
                                        <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            {assignedEvents.length}
                                        </span>
                                    </h3>

                                    {selectedAssignedIds.size > 0 && (
                                        <button
                                            onClick={handleUnassign}
                                            disabled={processing}
                                            className="animate-in fade-in slide-in-from-right-4 flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full text-sm font-medium hover:bg-destructive/20 transition-colors"
                                        >
                                            {processing ? 'Saving...' : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Unassign {selectedAssignedIds.size} Events
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {assignedEvents.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed rounded-xl bg-secondary/5 text-muted-foreground">
                                        <p>No events assigned yet.</p>
                                        <p className="text-xs opacity-60 mt-1">Select events below to assign them.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {assignedEvents.map(event => (
                                            <EventAssignmentCard
                                                key={event.id}
                                                data={event}
                                                selected={selectedAssignedIds.has(event.id)}
                                                onSelect={() => toggleAssigned(event.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* 3. Available Events (Horizontal Scroll) */}
                            <section className="space-y-3 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        Available Events
                                        <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            {availableEvents.length}
                                        </span>
                                    </h3>

                                    {selectedAvailableIds.size > 0 && (
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                            {/* Primary: Assign as Default Role */}
                                            <button
                                                onClick={() => handleAssign((selectedStaff as any)?.attributes?.role || 'Staff')}
                                                disabled={processing}
                                                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                                            >
                                                {processing ? 'Saving...' : (
                                                    <>
                                                        <PlusCircle className="w-4 h-4" />
                                                        Assign as {(selectedStaff as any)?.attributes?.role || 'Staff'}
                                                    </>
                                                )}
                                            </button>

                                            {/* Secondary: Assign as... (Simple dropdown for MVP) */}
                                            <div className="relative group">
                                                <button
                                                    disabled={processing}
                                                    className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
                                                >
                                                    Assign as...
                                                </button>
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg p-1 hidden group-hover:block z-50">
                                                    {roles.map(role => (
                                                        <button
                                                            key={role}
                                                            onClick={() => handleAssign(role)}
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                                    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-hide">
                                        {availableEvents.length === 0 ? (
                                            <div className="w-full py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                                                No upcoming events available.
                                            </div>
                                        ) : availableEvents.map(event => (
                                            <div key={event.id} className="min-w-[300px] max-w-[300px] snap-start">
                                                <EventAssignmentCard
                                                    data={event}
                                                    selected={selectedAvailableIds.has(event.id)}
                                                    onSelect={() => toggleAvailable(event.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            )}

            {mode === 'event' && (
                <div className="space-y-8">
                    {/* 1. Selector */}
                    <div className="max-w-md">
                        <label className="text-sm font-medium mb-1.5 block">Select Event</label>
                        <EventSelector
                            workspaceId={workspaceId}
                            selectedId={selectedEventId}
                            onSelect={setSelectedEventId}
                        />
                    </div>

                    {!selectedEventId || !eventData ? (
                        <div className="text-center py-20 border border-dashed rounded-xl bg-secondary/5 text-muted-foreground">
                            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>Select an event to manage staffing.</p>
                        </div>
                    ) : (
                        <EventAssignmentsPanel
                            workspaceId={workspaceId}
                            eventId={selectedEventId}
                            eventData={eventData}
                            onRefresh={refreshData}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
