import { getPhaseTypes } from '@/app/actions/catalog'
import { PhasesTable } from './phases-table'
import { ListChecks } from 'lucide-react'

export default async function PhasesPage() {
    const phases = await getPhaseTypes()

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">Phase Types</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ListChecks className="w-4 h-4" />
                        <p>Define operational phases (e.g. Cocktail, Banquet) to organize your event workflow.</p>
                    </div>
                </div>
            </div>

            <PhasesTable phases={phases || []} />
        </div>
    )
}
