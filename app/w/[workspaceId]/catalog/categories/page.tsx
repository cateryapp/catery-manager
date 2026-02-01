import { getCategories } from '@/app/actions/catalog'
import { CategoriesTable } from './categories-table'
import { Tag } from 'lucide-react'

export default async function CategoriesPage() {
    const categories = await getCategories()

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">Categories</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="w-4 h-4" />
                        <p>Organize your products into a hierarchy using categories.</p>
                    </div>
                </div>
            </div>

            <CategoriesTable categories={categories || []} />
        </div>
    )
}
