'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'

export async function createStaff(formData: FormData, workspaceId: string) {
    const supabase = await createClient()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string // stored in jsonb attributes

    const { error } = await supabase
        .from('staff')
        .insert({
            workspace_id: workspaceId,
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            attributes: { role }
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/w/${workspaceId}/staff`)
    return { success: true }
}

export async function updateStaff(formData: FormData, workspaceId: string, staffId: string) {
    const supabase = await createClient()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string

    const { error } = await supabase
        .from('staff')
        .update({
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            attributes: { role }
        })
        .eq('id', staffId)
        .eq('workspace_id', workspaceId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/w/${workspaceId}/staff`)
    revalidatePath(`/w/${workspaceId}/staff/${staffId}`)
    return { success: true }
}

export async function seedStaff(workspaceId: string) {
    const supabase = await createClient()

    // Verify user is in workspace
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const ROLES = ['waiter', 'chef', 'coordinator', 'cleaner']
    const NAMES = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Jamie', 'Charlie', 'Quinn', 'Sam', 'Riley', 'Avery', 'Peyton']
    const SURNAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']

    const staffData = []

    for (let i = 0; i < 100; i++) {
        const firstName = NAMES[Math.floor(Math.random() * NAMES.length)]
        const lastName = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
        const role = ROLES[Math.floor(Math.random() * ROLES.length)]

        staffData.push({
            workspace_id: workspaceId,
            first_name: firstName,
            last_name: lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            phone: `+34 600 ${String(i).padStart(6, '0')}`,
            attributes: { role }
        })
    }

    const { error } = await supabase.from('staff').insert(staffData)

    if (error) return { error: error.message }

    revalidatePath(`/w/${workspaceId}/staff`)
    return { success: true }
}

export async function generateStaffInvitation(workspaceId: string, staffId: string) {
    const supabase = await createClient()

    // 1. Verify Permission (Check if user is member of workspace)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Ideally check role (admin/owner) here too, but for MVP member is likely enough or RLS handles it?
    // RLS 'Access invitations in own workspaces' handles it if we use supabase client with auth?
    // But Server Action creates client with cookies. So RLS applies.

    // 2. Fetch Staff Email
    const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('email')
        .eq('id', staffId)
        .eq('workspace_id', workspaceId) // security check
        .single()

    if (staffError || !staff) return { error: 'Staff not found' }

    // 3. Generate Token
    const token = randomBytes(32).toString('hex')

    // 4. Insert Invitation
    const { error } = await supabase.from('staff_invitations').insert({
        workspace_id: workspaceId,
        staff_id: staffId,
        email: staff.email,
        token,
        status: 'pending'
    })

    if (error) return { error: error.message }

    // 5. Construct Deep Link
    const deepLink = `cateryportal://invite?token=${token}`

    // 6. "Send Email" (Simulated)
    // In production, use Resend or SendGrid here.
    console.log(`[Email Mock] Sending invite to ${staff.email}: ${deepLink}`)

    revalidatePath(`/w/${workspaceId}/staff`)
    return { success: true, deepLink }
}

export async function acceptStaffInvitation(token: string) {
    const supabase = await createClient()

    // 1. Authenticate User (The one accepting the invite)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized. Please login first.' }

    // 2. Validate Token
    const { data: invitation, error: inviteError } = await supabase
        .from('staff_invitations')
        .select('*')
        .eq('token', token)
        .single() // token is unique

    if (inviteError || !invitation) return { error: 'Invalid invitation token.' }

    if (invitation.status !== 'pending') return { error: 'Invitation already accepted or expired.' }

    // Check Expiry (if DB handles generated column fine, otherwise check JS side)
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    if (now > expiresAt) {
        return { error: 'Invitation expired.' }
    }

    // 3. Link User to Staff
    // Update staff record
    const { error: updateError } = await supabase
        .from('staff')
        .update({ user_id: user.id })
        .eq('id', invitation.staff_id)

    if (updateError) return { error: 'Failed to link account. ' + updateError.message }

    // 4. Mark Invitation Accepted
    await supabase
        .from('staff_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

    return { success: true, workspaceId: invitation.workspace_id }
}
