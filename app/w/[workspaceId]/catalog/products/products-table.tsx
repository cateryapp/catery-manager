'use client'

import { useState } from 'react'
import { Plus, Edit2, Archive, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Product = {
    id: string
    name: string
    sku: string | null
    product_type: string
    base_price: number
    is_active: boolean
    category: { name: string } | null
}

export function ProductsTable({ products, workspaceId }: { products: Product[], workspaceId: string }) {
    const router = useRouter()

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                {/* Search / Filters could go here */}
                <Link
                    href={`/w/${workspaceId}/catalog/products/new`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Product
                </Link>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px]">SKU</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Price</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px]">Status</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px] text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-muted-foreground h-24">
                                        No products found.
                                    </td>
                                </tr>
                            ) : products.map((product) => (
                                <tr key={product.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group">
                                    <td className="p-4 align-middle text-muted-foreground font-mono text-xs">{product.sku || '-'}</td>
                                    <td className="p-4 align-middle font-medium">{product.name}</td>
                                    <td className="p-4 align-middle">{product.category?.name || '-'}</td>
                                    <td className="p-4 align-middle capitalize">{product.product_type}</td>
                                    <td className="p-4 align-middle text-right font-mono">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.base_price)}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${product.is_active ? 'border-transparent bg-green-100 text-green-800' : 'border-transparent bg-gray-100 text-gray-800'}`}>
                                            {product.is_active ? 'Active' : 'Archived'}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/w/${workspaceId}/catalog/products/${product.id}`}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
