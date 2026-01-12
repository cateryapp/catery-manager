import { createClient } from '@/utils/supabase/server'
import { Plus, Search, Mail, Phone, Briefcase } from 'lucide-react'
import AddStaffDialog from './add-staff-dialog'
import InviteStaffButton from './invite-staff-button'

export default async function StaffPage({
    params
}: {
    params: Promise<{ workspaceId: string }>
}) {
    const { workspaceId } = await params
    const supabase = await createClient()

    const { data: staffList } = await supabase
        .from('staff')
        .select(`
            *,
            staff_invitations (
                status
            )
        `)
        .eq('workspace_id', workspaceId)
        .order('first_name', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Staff Roster</h1>
                    <p className="text-muted-foreground">Your team of chefs, waiters, and coordinators.</p>
                </div>
                <AddStaffDialog workspaceId={workspaceId} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {staffList?.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-card border border-border rounded-xl">
                        <p className="text-muted-foreground">No staff members yet.</p>
                    </div>
                )}

                {staffList?.map((staff) => {
                    const isLinked = !!staff.user_id
                    const hasPendingInvite = staff.staff_invitations?.some((i: any) => i.status === 'pending')

                    return (
                        <div key={staff.id} className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors flex flex-col gap-3 group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        {staff.first_name[0]}{staff.last_name?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{staff.first_name} {staff.last_name}</div>
                                        <div className="text-xs text-muted-foreground overflow-hidden text-ellipsis capitalize">
                                            {(staff.attributes as any)?.role || 'Staff'}
                                        </div>
                                    </div>
                                </div>
                                <InviteStaffButton
                                    workspaceId={workspaceId}
                                    staffId={staff.id}
                                    email={staff.email}
                                    isLinked={isLinked}
                                    hasPendingInvite={hasPendingInvite}
                                />
                            </div>

                            <div className="space-y-2 mt-2 pt-3 border-t border-border/50 text-sm md:text-xs">
                                {staff.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                        <Mail className="w-3.5 h-3.5" />
                                        <a href={`mailto:${staff.email}`} className="truncate">{staff.email}</a>
                                    </div>
                                )}
                                {staff.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                        <Phone className="w-3.5 h-3.5" />
                                        <a href={`tel:${staff.phone}`}>{staff.phone}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
