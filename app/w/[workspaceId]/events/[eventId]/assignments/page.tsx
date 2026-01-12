import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Clock, User } from 'lucide-react'
import AssignStaffModal from './assign-modal'
import { removeAssignment } from './actions'

export default async function AssignmentsPage({
    params
}: {
    params: Promise<{ workspaceId: string; eventId: string }>
}) {
    const { workspaceId, eventId } = await params
    const supabase = await createClient()

    // Fetch Assignments with Staff details
    const { data: assignments } = await supabase
        .from('assignments')
        .select('*, staff(*)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

    // Fetch all staff for the picker
    const { data: allStaff } = await supabase
        .from('staff')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('first_name')

    // Prepare staff list excluding already assigned ones (optional, or just disable in UI)
    // For MVP, just pass all.

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Staff Assignments</h2>
                    <p className="text-sm text-muted-foreground">Who is working this event?</p>
                </div>
                <AssignStaffModal workspaceId={workspaceId} eventId={eventId} staffList={allStaff || []} />
            </div>

            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                        <tr>
                            <th className="px-4 py-3 font-medium">Staff Member</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {assignments?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    No staff assigned yet.
                                </td>
                            </tr>
                        )}

                        {assignments?.map((assignment) => (
                            <tr key={assignment.id} className="group hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                                            {assignment.staff?.first_name[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium">{assignment.staff?.first_name} {assignment.staff?.last_name}</div>
                                            <div className="text-xs text-muted-foreground">{assignment.staff?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-medium capitalize">
                                        <User className="w-3 h-3" />
                                        {assignment.role || 'General'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs text-muted-foreground capitalize">{assignment.status}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <form action={async () => {
                                        'use server'
                                        await removeAssignment(assignment.id, `/w/${workspaceId}/events/${eventId}/assignments`)
                                    }}>
                                        <button className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
