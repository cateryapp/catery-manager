import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Mail, Phone, Calendar, User, Smartphone, CheckCircle } from 'lucide-react'
import InviteStaffButton from '../invite-staff-button'
import EditStaffDialog from '../edit-staff-dialog'
import { format } from 'date-fns'

export default async function StaffDetailPage({
    params
}: {
    params: Promise<{ workspaceId: string, staffId: string }>
}) {
    const { workspaceId, staffId } = await params
    const supabase = await createClient()

    const { data: staff } = await supabase
        .from('staff')
        .select(`
            *,
            staff_invitations (
                status
            )
        `)
        .eq('id', staffId)
        .eq('workspace_id', workspaceId)
        .single()

    if (!staff) {
        notFound()
    }

    const isLinked = !!staff.user_id
    const hasPendingInvite = staff.staff_invitations?.some((i: any) => i.status === 'pending')

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/w/${workspaceId}/staff`}
                    className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        {staff.first_name} {staff.last_name}
                        <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-secondary text-foreground capitalize border border-border">
                            {(staff.attributes as any)?.role || 'Staff'}
                        </span>
                    </h1>
                </div>
                <EditStaffDialog workspaceId={workspaceId} staff={staff} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Info Card */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">Personal Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Email Address</span>
                                <span className="font-medium">{staff.email || 'Not provided'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Phone Number</span>
                                <span className="font-medium">{staff.phone || 'Not provided'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Date Added</span>
                                <span className="font-medium">
                                    {format(new Date(staff.created_at), 'PPP')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portal Access Card */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-border">
                        <Smartphone className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">Portal App Access</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Account Status</p>
                                <p className="text-xs text-muted-foreground">
                                    {isLinked
                                        ? 'This staff member has successfully linked their Catery Portal app.'
                                        : 'Send an invitation to allow this employee to access their schedule on the mobile app.'}
                                </p>
                            </div>

                            {isLinked ? (
                                <div className="text-emerald-500 text-sm flex items-center gap-1.5 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Active</span>
                                </div>
                            ) : (
                                <InviteStaffButton
                                    workspaceId={workspaceId}
                                    staffId={staffId}
                                    email={staff.email}
                                    isLinked={isLinked}
                                    hasPendingInvite={hasPendingInvite}
                                />
                            )}
                        </div>

                        {hasPendingInvite && !isLinked && (
                            <div className="p-3 bg-secondary/50 rounded-lg border border-border text-xs text-muted-foreground">
                                An invitation is currently pending. You can resend it if they haven't received it.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
