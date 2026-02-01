import { getCatalogSettings, getCategories, getPhaseTypes } from '@/app/actions/catalog'
import { ProductWizard } from '../product-wizard'

export default async function NewProductPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = await params

    // Fetch settings and categories to pass to the client component
    const settings = await getCatalogSettings()
    const categories = await getCategories()
    const phaseTypes = await getPhaseTypes()

    return (
        <ProductWizard
            workspaceId={workspaceId}
            settings={settings}
            categories={categories || []}
            phaseTypes={phaseTypes || []}
        />
    )
}
