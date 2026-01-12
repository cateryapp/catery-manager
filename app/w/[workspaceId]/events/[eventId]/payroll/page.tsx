import { createClient } from '@/utils/supabase/server'
import PayrollTable from './payroll-table'
import { Download, Lock } from 'lucide-react'

export default async function PayrollPage({
    params
}: {
    params: Promise<{ workspaceId: string; eventId: string }>
}) {
    const { workspaceId, eventId } = await params
    const supabase = await createClient()

    const { data: assignments } = await supabase
        .from('assignments')
        .select('*, staff(first_name, last_name, email)')
        .eq('event_id', eventId)
        .order('staff(first_name)')

    const totalPayroll = assignments?.reduce((acc, curr) => acc + (curr.net_amount || 0), 0) || 0

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Event Payroll</h2>
                    <p className="text-sm text-muted-foreground">Manage and finalize payments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        <Lock className="w-4 h-4" />
                        Finalize
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/20 border border-border">
                <div className="text-sm font-medium text-muted-foreground">Total Net Payable</div>
                <div className="text-2xl font-bold font-mono">€{totalPayroll.toFixed(2)}</div>
            </div>

            <PayrollTable assignments={assignments || []} workspaceId={workspaceId} eventId={eventId} />
        </div>
    )
}
