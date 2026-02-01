import { getProducts } from '@/app/actions/catalog'
import { ProductsTable } from './products-table'
import { PackageSearch } from 'lucide-react'

export default async function ProductsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = await params
    // Future: parse search params for filters
    const products = await getProducts()

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">Products</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <PackageSearch className="w-4 h-4" />
                        <p>Manage your sellable items, bundles, and services.</p>
                    </div>
                </div>
            </div>

            <ProductsTable products={products || []} workspaceId={workspaceId} />
        </div>
    )
}
