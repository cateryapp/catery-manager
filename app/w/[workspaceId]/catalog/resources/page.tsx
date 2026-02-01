import { getResources } from '@/app/actions/catalog'
import { ResourcesTable } from './resources-table'
import { Database } from 'lucide-react'

export default async function ResourcesPage() {
    const resources = await getResources()

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">Resources</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Database className="w-4 h-4" />
                        <p>Manage ingredients, equipment, and staff types for accurate costing.</p>
                    </div>
                </div>
            </div>

            <ResourcesTable resources={resources || []} />
        </div>
    )
}
