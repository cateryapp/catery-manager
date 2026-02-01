'use client'

import { useState, useEffect } from 'react'
import { getProducts } from '@/app/actions/catalog'
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react'
import { useDebounce } from '@/utils/use-debounce' // Need to implement this or just use simple timeout

type Product = {
    id: string
    name: string
    sku: string | null
    product_type: string
}

interface ProductSelectorProps {
    onSelect: (product: Product) => void
    excludedIds?: string[]
}

export function ProductSelector({ onSelect, excludedIds = [] }: ProductSelectorProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    // Simple debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (open) search(query)
        }, 300)
        return () => clearTimeout(timer)
    }, [query, open])

    async function search(q: string) {
        setLoading(true)
        try {
            const res = await getProducts({ search: q })
            setResults(res || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <div
                className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer bg-background hover:bg-accent/50"
                onClick={() => setOpen(!open)}
            >
                <span className="text-sm text-muted-foreground">Select a product...</span>
                <ChevronsUpDown className="w-4 h-4 opacity-50" />
            </div>

            {open && (
                <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-md shadow-md z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center border-b px-3">
                        <Search className="w-4 h-4 mr-2 opacity-50" />
                        <input
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Search products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Searching...
                            </div>
                        ) : results.length === 0 ? (
                            <div className="py-2 px-2 text-sm text-muted-foreground text-center">No products found.</div>
                        ) : (
                            results.filter(p => !excludedIds.includes(p.id)).map(product => (
                                <div
                                    key={product.id}
                                    className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                    onClick={() => {
                                        onSelect(product)
                                        setOpen(false)
                                        setQuery('')
                                    }}
                                >
                                    <span className="font-medium mr-2">{product.name}</span>
                                    {product.sku && <span className="text-xs text-muted-foreground font-mono mr-auto">{product.sku}</span>}
                                    <span className="text-xs text-muted-foreground uppercase bg-muted px-1 rounded">{product.product_type}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {open && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpen(false)} />}
        </div>
    )
}
