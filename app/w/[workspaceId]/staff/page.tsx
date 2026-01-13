import { createClient } from '@/utils/supabase/server'
import AddStaffDialog from './add-staff-dialog'
import StaffTable from './staff-table'
import SeedButton from './seed-button'

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
        .order('assiduity_score', { ascending: false })
        .order('first_name', { ascending: true })

    // Extract unique roles for the filter
    const roles = Array.from(new Set(staffList?.map(s => (s.attributes as any)?.role).filter(Boolean))) as string[]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        Staff Roster
                        {process.env.NODE_ENV === 'development' && <SeedButton workspaceId={workspaceId} />}
                    </h1>
                    <p className="text-muted-foreground">Your team of chefs, waiters, and coordinators.</p>
                </div>
                <AddStaffDialog workspaceId={workspaceId} />
            </div>

            <StaffTable
                workspaceId={workspaceId}
                staff={staffList || []}
                roles={roles}
            />
        </div>
    )
}
