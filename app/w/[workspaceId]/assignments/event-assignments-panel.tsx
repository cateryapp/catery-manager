'use client'

import { useState, useMemo } from 'react'
import { bulkAssignStaff, bulkUnassignStaff, updateAssignmentRole } from './actions'
import EventAssignmentCard from './event-card'
import { Check, X, ShieldCheck, UserCheck, Filter, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventAssignmentsPanelProps {
    workspaceId: string
    eventId: string
    eventData: any
    onRefresh: () => void
}

export default function EventAssignmentsPanel({
    workspaceId,
    eventId,
    eventData,
    onRefresh
}: EventAssignmentsPanelProps) {
    const [processing, setProcessing] = useState(false)

    // Candidate Pool State
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set())
    const [showAvailableOnly, setShowAvailableOnly] = useState(false)

    // Derived Data
    const roles = eventData.roles || []

    // Filter Candidates
    const filteredCandidates = useMemo(() => {
        let candidates = eventData.availableStaff
        if (showAvailableOnly) {
            candidates = candidates.filter((c: any) => c.is_available)
        }
        return candidates
    }, [eventData.availableStaff, showAvailableOnly])

    // Actions
    const handleBulkAssign = async () => {
        if (selectedCandidateIds.size === 0) return
        setProcessing(true)
        try {
            // Assign each selected staff with their DEFAULT role (or 'Staff' if none)
            // We can't do a single bulk call if roles differ, but our bulkAssignStaff takes ONE role for all.
            // Requirement: "Select staff and assign to event... by default the default role of the person should be assigned"
            // This means we might need multiple calls or a smarter bulk action.
            // For MVP efficiency: We'll grouping by role locally and firing parallel requests.

            const staffToAssign = filteredCandidates.filter((c: any) => selectedCandidateIds.has(c.id))

            const staffByRole: Record<string, string[]> = {}
            staffToAssign.forEach((staff: any) => {
                let role = (staff.attributes?.role || 'Staff')
                // Normalize role case to match configured roles if possible
                const matchedRole = roles.find((r: string) => r.toLowerCase() === role.toLowerCase())
                if (matchedRole) role = matchedRole

                if (!staffByRole[role]) staffByRole[role] = []
                staffByRole[role].push(staff.id)
            })

            const promises = Object.entries(staffByRole).map(([role, staffIds]) =>
                // We reuse bulkAssignStaff but we loop it essentially 
                // Actually bulkAssignStaff takes (staffId (singular), eventIds[], role) OR 
                // Wait, looking at actions.ts... bulkAssignStaff(workspaceId, staffId, eventIds[], role)
                // Ah, it assigns ONE staff to MANY events. 
                // We need MANY staff to ONE event. 
                // We should probably just call it in a loop or make a new action. 
                // Loop is fine for < 50 items.
                Promise.all(staffIds.map(staffId =>
                    bulkAssignStaff(workspaceId, staffId, [eventId], role)
                ))
            )

            await Promise.all(promises)

            setSelectedCandidateIds(new Set())
            onRefresh()
        } catch (e) {
            console.error(e)
            alert('Failed to assign staff')
        }
        setProcessing(false)
    }

    const handleUpdateRole = async (assignmentId: string, newRole: string) => {
        if (!confirm(`Change role to ${newRole}?`)) return
        setProcessing(true)
        try {
            await updateAssignmentRole(workspaceId, assignmentId, newRole)
            onRefresh()
        } catch (e) {
            console.error(e)
        }
        setProcessing(false)
    }

    const handleUnassign = async (assignmentId: string) => {
        if (!confirm('Unassign staff member?')) return
        setProcessing(true)
        try {
            await bulkUnassignStaff(workspaceId, [assignmentId])
            onRefresh()
        } catch (e) { console.error(e) }
        setProcessing(false)
    }

    // Selection Logic
    const toggleSelect = (id: string) => {
        const next = new Set(selectedCandidateIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedCandidateIds(next)
    }

    const toggleSelectAll = () => {
        if (selectedCandidateIds.size === filteredCandidates.length) {
            setSelectedCandidateIds(new Set())
        } else {
            setSelectedCandidateIds(new Set(filteredCandidates.map((c: any) => c.id)))
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Header Card */}
            <EventAssignmentCard
                data={{
                    ...eventData,
                    event: eventData.event,
                    isAssigned: false,
                    id: eventData.event.id
                }}
                disabled={true}
            />

            {/* 2. Assigned Team */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        Assigned Team
                        <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {eventData.assignedStaff.length}
                        </span>
                    </h3>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                    {eventData.assignedStaff.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No staff assigned yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {eventData.assignedStaff.map((staff: any) => (
                                <div key={staff.id} className="p-3 flex items-center gap-4 hover:bg-accent/5 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                        {staff.first_name[0]}{staff.last_name?.[0]}
                                    </div>

                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                                        <div>
                                            <div className="font-medium text-sm">
                                                {staff.first_name} {staff.last_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {staff.email}
                                            </div>
                                        </div>

                                        {/* Editable Role */}
                                        <div className="flex items-center gap-2">
                                            <div className="relative group w-full max-w-[180px]">
                                                <select
                                                    disabled={processing}
                                                    value={staff.role}
                                                    onChange={(e) => handleUpdateRole(staff.assignmentId, e.target.value)}
                                                    className="w-full appearance-none bg-secondary/50 border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-secondary"
                                                >
                                                    {roles.map((r: string) => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleUnassign(staff.assignmentId)}
                                        disabled={processing}
                                        className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
                                        title="Unassign"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Candidate Pool (Table) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        Candidate Pool
                        <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {filteredCandidates.length}
                        </span>
                    </h3>

                    <div className="flex items-center gap-3">
                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors",
                                showAvailableOnly
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-background border-border text-muted-foreground hover:bg-accent"
                            )}
                        >
                            <UserCheck className="w-4 h-4" />
                            Available Only
                        </button>

                        {/* Bulk Assign Action */}
                        {selectedCandidateIds.size > 0 && (
                            <button
                                onClick={handleBulkAssign}
                                disabled={processing}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm animate-in zoom-in-50"
                            >
                                Assign Selected ({selectedCandidateIds.size})
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/30 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="p-3 w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-border"
                                            checked={selectedCandidateIds.size === filteredCandidates.length && filteredCandidates.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="p-3 font-medium">Name</th>
                                    <th className="p-3 font-medium">Default Role</th>
                                    <th className="p-3 font-medium">Assiduity</th>
                                    <th className="p-3 font-medium">Availability</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredCandidates.map((staff: any) => (
                                    <tr
                                        key={staff.id}
                                        className={cn(
                                            "hover:bg-accent/5 transition-colors cursor-pointer",
                                            selectedCandidateIds.has(staff.id) && "bg-accent/10"
                                        )}
                                        onClick={(e) => {
                                            if ((e.target as HTMLElement).tagName !== 'INPUT') toggleSelect(staff.id)
                                        }}
                                    >
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                className="rounded border-border"
                                                checked={selectedCandidateIds.has(staff.id)}
                                                onChange={() => toggleSelect(staff.id)}
                                            />
                                        </td>
                                        <td className="p-3 font-medium">
                                            {staff.first_name} {staff.last_name}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {staff.attributes?.role || 'Staff'}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <ShieldCheck className="w-3 h-3" />
                                                {staff.assiduity_score || 0}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {staff.is_available ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/30 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredCandidates.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No candidates found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}
