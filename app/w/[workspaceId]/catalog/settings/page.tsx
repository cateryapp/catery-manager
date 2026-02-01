import { getCatalogSettings } from '@/app/actions/catalog'
import { SettingsForm } from './settings-form'
import { CheckCircle2, Sliders } from 'lucide-react'

export default async function CatalogSettingsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = await params
    const settings = await getCatalogSettings()

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">Catalog Settings</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Sliders className="w-4 h-4" />
                    <p>Configure how the catalog module behaves for your organization.</p>
                </div>
            </div>

            <SettingsForm initialSettings={settings} workspaceId={workspaceId} />
        </div>
    )
}
