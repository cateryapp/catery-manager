import { getProduct, getCategories, getPhaseTypes, getCatalogSettings } from '@/app/actions/catalog'
import { ProductWizard } from '../product-wizard'
import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        workspaceId: string
        productId: string
    }
}

export default async function EditProductPage({ params }: PageProps) {
    const { workspaceId, productId } = await params

    // Fetch data in parallel
    const [product, categories, phaseTypes, settings] = await Promise.all([
        getProduct(productId).catch(() => null),
        getCategories(),
        getPhaseTypes(),
        getCatalogSettings()
    ])

    if (!product) {
        return notFound()
    }

    return (
        <ProductWizard
            workspaceId={workspaceId}
            settings={settings}
            categories={categories || []}
            phaseTypes={phaseTypes || []}
            initialData={product}
        />
    )
}
