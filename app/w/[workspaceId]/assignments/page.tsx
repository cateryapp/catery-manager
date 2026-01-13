import AssignmentsView from './assignments-view'
import SeedEventsButton from './seed-events-button'

export default async function AssignmentsPage({
    params
}: {
    params: Promise<{ workspaceId: string }>
}) {
    const { workspaceId } = await params

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">Manage staff allocations and view schedules.</p>
                </div>
                <SeedEventsButton workspaceId={workspaceId} />
            </div>

            <AssignmentsView workspaceId={workspaceId} />
        </div>
    )
}
