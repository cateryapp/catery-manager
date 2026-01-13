'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEventAssignmentData(workspaceId: string, eventId: string) {
    const supabase = await createClient()

    // 1. Fetch Event Details
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select(`
            id,
            name,
            location,
            start_at,
            end_at,
            estimated_guests,
            staffing_requirements,
            status
        `)
        .eq('id', eventId)
        .single()

    if (eventError || !event) {
        console.error('Error fetching event:', eventError)
        return null
    }

    // Fetch config for sorting roles (moved up as it's needed for role normalization)
    const { data: configData } = await supabase
        .from('workspace_configs')
        .select('value')
        .eq('workspace_id', workspaceId)
        .eq('key', 'event_roles')
        .single()

    const defaultRoles = ['Manager', 'Waiter', 'Cook', 'Office', 'Cleaning', 'Logistics']
    const roleOrder = (configData?.value as string[]) || defaultRoles

    // Helper to get normalized role
    const getNormalizedRole = (role: string | null | undefined) => {
        let normalizedRole = role || 'Staff'
        const exactMatch = roleOrder.find(r => r.toLowerCase() === normalizedRole.toLowerCase())
        if (exactMatch) {
            normalizedRole = exactMatch
        } else {
            // Capitalize first letter if no exact match found in roleOrder
            normalizedRole = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1).toLowerCase()
        }
        return normalizedRole
    }

    // 2. Fetch All Assignments for this Event (includes availability markers)
    const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
            id,
            staff_id,
            role,
            status,
            is_available,
            staff:staff_id (
                id,
                first_name,
                last_name,
                email,
                phone,
                assiduity_score,
                attributes
            )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

    const assignmentMap = new Map()
    assignments?.forEach(a => {
        assignmentMap.set(a.staff_id, a)
    })

    // 3. Fetch ALL Staff in Workspace (to build the candidate pool)
    const { data: allStaff } = await supabase
        .from('staff')
        .select('id, first_name, last_name, email, assiduity_score, attributes')
        .eq('workspace_id', workspaceId)
        .order('assiduity_score', { ascending: false })

    // 4. Categorize Staff
    const assignedStaff: any[] = []
    const availableStaff: any[] = []

    allStaff?.forEach(staff => {
        const assignment = assignmentMap.get(staff.id)

        // Has a real assignment? (Pending, Confirmed, Completed)
        const hasActiveAssignment = assignment && ['pending', 'confirmed', 'completed'].includes(assignment.status)

        const staffData = {
            ...staff,
            assignmentId: assignment?.id,
            role: assignment?.role || (staff.attributes as any)?.role || 'Staff',
            status: assignment?.status,
            is_available: assignment?.is_available || false
        }

        if (hasActiveAssignment) {
            assignedStaff.push(staffData)
        } else {
            availableStaff.push(staffData)
        }
    })

    // 5. Sort Available Staff
    // Priority: is_available (true first) -> assiduity_score (high first)
    availableStaff.sort((a, b) => {
        if (a.is_available === b.is_available) {
            return (b.assiduity_score || 0) - (a.assiduity_score || 0)
        }
        return a.is_available ? -1 : 1
    })

    // 6. Fetch Global Staffing Counts for this event
    // We already have the list of assignments, so we can calculate it locally!
    const roleCounts: Record<string, number> = {}
    assignments?.forEach(a => {
        if (['pending', 'confirmed', 'completed'].includes(a.status)) {
            const r = (a.role || 'unknown').toLowerCase()
            roleCounts[r] = (roleCounts[r] || 0) + 1
        }
    })

    // (Config already fetched above)


    const getRoleRank = (role: string) => {
        const index = roleOrder.findIndex(r => r.toLowerCase() === role.toLowerCase())
        return index === -1 ? 999 : index
    }

    const requirements = event.staffing_requirements || {}
    const allRoles = new Set([
        ...Object.keys(requirements),
        ...Object.keys(roleCounts)
    ])

    const staffingStatus = Array.from(allRoles).map(role => ({
        role,
        required: Number(requirements[role] || 0),
        assigned: roleCounts[role.toLowerCase()] || 0
    })).sort((a, b) => getRoleRank(a.role) - getRoleRank(b.role))

    return {
        event: { ...event, staffingStatus },
        assignedStaff,
        availableStaff,
        roles: roleOrder
    }
}

export async function updateAssignmentRole(workspaceId: string, assignmentId: string, newRole: string) {
    const supabase = await createClient()

    // Verify workspace access (implied by RLS usually, but good to be safe if Logic requires it)
    // Here RLS "Access assignments in own workspaces" handles it.

    const { error } = await supabase
        .from('assignments')
        .update({ role: newRole })
        .eq('id', assignmentId)
        .eq('workspace_id', workspaceId)

    if (error) throw error
    revalidatePath(`/w/${workspaceId}/assignments`)
    return { success: true }
}

export async function getStaffAssignmentBoardData(workspaceId: string, staffId: string) {
    const supabase = await createClient()

    // 1. Fetch ALL upcoming events (draft or confirmed)
    // We need this list to show "Available Events"
    const { data: allEvents, error: eventsError } = await supabase
        .from('events')
        .select(`
            id,
            name,
            location,
            start_at,
            end_at,
            estimated_guests,
            staffing_requirements,
            status
        `)
        .eq('workspace_id', workspaceId)
        .gte('start_at', new Date().toISOString()) // Only future events
        .order('start_at', { ascending: true })

    if (eventsError) {
        console.error('Error fetching events:', eventsError)
        return { assignedEvents: [], availableEvents: [] }
    }

    // 2. Fetch existing assignments for this staff member
    const { data: myAssignments } = await supabase
        .from('assignments')
        .select('id, event_id, role, status')
        .eq('workspace_id', workspaceId)
        .eq('staff_id', staffId)

    const myAssignmentMap = new Map()
    myAssignments?.forEach(a => {
        myAssignmentMap.set(a.event_id, a)
    })

    // 3. Fetch GLOBAL staffing counts for these events (to show 3/8)
    const eventIds = allEvents.map(e => e.id)
    const { data: allEventAssignments } = await supabase
        .from('assignments')
        .select('event_id, role')
        .in('event_id', eventIds)

    const countsByEvent: Record<string, Record<string, number>> = {}
    allEventAssignments?.forEach((a) => {
        if (!countsByEvent[a.event_id]) countsByEvent[a.event_id] = {}
        const role = a.role?.toLowerCase() || 'unknown'
        countsByEvent[a.event_id][role] = (countsByEvent[a.event_id][role] || 0) + 1
    })

    // 5. Fetch Role Configuration
    const { data: configData } = await supabase
        .from('workspace_configs')
        .select('value')
        .eq('workspace_id', workspaceId)
        .eq('key', 'event_roles')
        .single()

    // Default roles if no config exists
    const defaultRoles = ['Manager', 'Waiter', 'Cook', 'Office', 'Cleaning', 'Logistics']
    const roleOrder = (configData?.value as string[]) || defaultRoles

    // Helper to sort roles
    const getRoleRank = (role: string) => {
        const index = roleOrder.findIndex(r => r.toLowerCase() === role.toLowerCase())
        return index === -1 ? 999 : index
    }

    // 4. Construct the two lists
    const assignedEvents: any[] = []
    const availableEvents: any[] = []

    allEvents.forEach(event => {
        const requirements = event.staffing_requirements || {}
        const currentCounts = countsByEvent[event.id] || {}

        // Merge requirements with actual assignments (incase we have assignments for roles not required)
        // For MVP, we'll just iterate based on requirements + keys(currentCounts)
        const allRoles = new Set([
            ...Object.keys(requirements),
            ...Object.keys(currentCounts)
        ])

        const staffingStatus = Array.from(allRoles).map(role => ({
            role,
            required: Number(requirements[role] || 0),
            assigned: currentCounts[role.toLowerCase()] || 0
        })).sort((a, b) => getRoleRank(a.role) - getRoleRank(b.role))
        // We sort by the configured order

        // Is the user assigned?
        const myAssignment = myAssignmentMap.get(event.id)

        const eventData = {
            id: event.id, // Event ID is the key for the card
            assignmentId: myAssignment?.id, // ID of the assignment row (if exists)
            isAssigned: !!myAssignment,
            myRole: myAssignment?.role,
            status: myAssignment?.status || event.status, // Assignment status OR Event status
            event: {
                ...event,
                staffingStatus
            }
        }

        if (myAssignment) {
            assignedEvents.push(eventData)
        } else {
            availableEvents.push(eventData)
        }
    })

    return { assignedEvents, availableEvents, roles: roleOrder }
}

export async function bulkAssignStaff(workspaceId: string, staffId: string, eventIds: string[], role: string = 'Staff') {
    const supabase = await createClient()

    // Explicit check-then-write to ensure robustness
    for (const eventId of eventIds) {
        // 1. Check existing
        const { data: existing } = await supabase
            .from('assignments')
            .select('id')
            .eq('event_id', eventId)
            .eq('staff_id', staffId)
            .single()

        if (existing) {
            // 2. Update
            const { error: updateError } = await supabase
                .from('assignments')
                .update({ role, status: 'pending' })
                .eq('id', existing.id)

            if (updateError) {
                console.error('Error updating assignment:', updateError)
                throw new Error('Failed to update assignment')
            }
        } else {
            // 3. Insert
            const { error: insertError } = await supabase
                .from('assignments')
                .insert({
                    workspace_id: workspaceId,
                    staff_id: staffId,
                    event_id: eventId,
                    role,
                    status: 'pending'
                })

            if (insertError) {
                console.error('Error inserting assignment:', insertError)
                throw new Error('Failed to insert assignment')
            }
        }
    }

    revalidatePath(`/w/${workspaceId}/assignments`)
    return { success: true }
}

export async function bulkUnassignStaff(workspaceId: string, assignmentIds: string[]) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('workspace_id', workspaceId) // Safety check
        .in('id', assignmentIds)

    if (error) {
        console.error('Error unassigning staff:', error)
        throw new Error('Failed to unassign staff')
    }

    revalidatePath(`/w/${workspaceId}/assignments`)
    return { success: true }
}
