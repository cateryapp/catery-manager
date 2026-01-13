'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { addDays, setHours, setMinutes } from 'date-fns'

export async function seedEvents(workspaceId: string) {
    const supabase = await createClient()
    const events = []
    const now = new Date()

    const eventTypes = [
        { name: 'Wedding', requirements: { waiter: 6, chef: 3, cleaning: 2 }, guests: 120 },
        { name: 'Corporate Dinner', requirements: { waiter: 4, chef: 2 }, guests: 50 },
        { name: 'Birthday Party', requirements: { waiter: 3, chef: 1, cleaning: 1 }, guests: 40 },
        { name: 'Tech Conference', requirements: { waiter: 8, chef: 4, coordinator: 2 }, guests: 200 }
    ]

    for (let i = 0; i < 14; i++) {
        // Create 2 events per day
        for (let j = 0; j < 2; j++) {
            const date = addDays(now, i)
            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]

            // Random start time between 10am and 6pm
            const startHour = 10 + Math.floor(Math.random() * 8)
            const startAt = setHours(setMinutes(date, 0), startHour)
            const endAt = setHours(setMinutes(date, 0), startHour + 4)

            events.push({
                workspace_id: workspaceId,
                name: `${type.name} - ${i + 1}`,
                location: `Venue ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
                start_at: startAt.toISOString(),
                end_at: endAt.toISOString(),
                status: 'confirmed',
                estimated_guests: type.guests + Math.floor(Math.random() * 20),
                staffing_requirements: type.requirements
            })
        }
    }

    const { error } = await supabase.from('events').insert(events)

    if (error) {
        console.error('Seed error:', error)
        throw new Error('Failed to seed events')
    }

    revalidatePath(`/w/${workspaceId}/events`)
    return { success: true }
}

export async function createEvent(formData: FormData, workspaceId: string) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const location = formData.get('location') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const guestCount = formData.get('guestCount') as string
    const status = 'draft'

    // Construct timestamps
    // If no time provided, default to 00:00:00 locally? Or UTC? 
    // Ideally we treat "Event Date" as a semantic day, but DB stores timestamptz. 
    // We'll append 'T00:00:00' if time missing.

    const startIso = startTime ? `${date}T${startTime}:00` : `${date}T00:00:00`
    const endIso = endTime ? `${date}T${endTime}:00` : null // End date assumed same day for MVP creation, or nullable

    const { data: event, error } = await supabase
        .from('events')
        .insert({
            workspace_id: workspaceId,
            name,
            location,
            start_at: new Date(startIso).toISOString(),
            end_at: endIso ? new Date(endIso).toISOString() : null,
            default_guest_count: guestCount ? parseInt(guestCount) : 0,
            status
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    redirect(`/w/${workspaceId}/events/${event.id}`)
}
