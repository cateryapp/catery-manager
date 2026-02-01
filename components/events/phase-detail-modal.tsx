'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EventPhase, EventPhaseItem } from '@/types/event-types'
import { updateEventPhase, deleteEventPhase } from '@/app/actions/event-phases'
import { getEventPhaseItems, addEventPhaseItem, deleteEventPhaseItem, getCompatibleProducts } from '@/app/actions/event-items'
import { Trash2, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProductConfigModal } from './product-config-modal'

interface PhaseDetailModalProps {
    phase: EventPhase | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PhaseDetailModal({ phase, open, onOpenChange }: PhaseDetailModalProps) {
    const [nameOverride, setNameOverride] = useState('')
    const [items, setItems] = useState<EventPhaseItem[]>([])
    const [loadingItems, setLoadingItems] = useState(false)
    const [compatibleProducts, setCompatibleProducts] = useState<any[]>([])
    const [addingProduct, setAddingProduct] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [configProduct, setConfigProduct] = useState<any | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (phase) {
            setNameOverride(phase.name_override || phase.phase_type?.name || '')
            loadItems()
            loadCompatibleProducts()
        }
    }, [phase])

    async function loadItems() {
        if (!phase) return
        setLoadingItems(true)
        try {
            const data = await getEventPhaseItems(phase.id)
            setItems(data || [])
        } catch (e) {
            console.error(e)
        }
        setLoadingItems(false)
    }

    async function loadCompatibleProducts() {
        if (!phase) return
        try {
            const data = await getCompatibleProducts(phase.phase_type_id, searchQuery)
            setCompatibleProducts(data || [])
        } catch (e) {
            console.error(e)
        }
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (phase) loadCompatibleProducts()
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    async function handleSavePhase() {
        if (!phase) return
        await updateEventPhase(phase.id, { name_override: nameOverride })
        router.refresh()
        onOpenChange(false)
    }

    async function handleDeletePhase() {
        if (!phase || !confirm('Delete this phase and all its items?')) return
        await deleteEventPhase(phase.id)
        router.refresh()
        onOpenChange(false)
    }

    async function handleAddProduct(product: any) {
        if (!phase) return

        if (product.product_type === 'bundle') {
            setConfigProduct(product)
            return
        }

        await addEventPhaseItem(phase.id, product.id)
        await loadItems()
        router.refresh()
    }

    async function handleRemoveItem(itemId: string) {
        if (!confirm('Remove item?')) return
        await deleteEventPhaseItem(itemId)
        await loadItems()
        router.refresh()
    }

    if (!phase) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <DialogTitle>Edit Phase</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {phase.phase_type?.name}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex divide-x">
                    {/* Left Column: Details */}
                    <div className="w-1/3 p-6 space-y-6 overflow-y-auto">
                        <div className="space-y-2">
                            <Label>Phase Name</Label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={nameOverride}
                                onChange={(e) => setNameOverride(e.target.value)}
                            />
                        </div>

                        <div className="pt-8">
                            <Button variant="destructive" size="sm" onClick={handleDeletePhase}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Phase
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Items & Adding */}
                    <div className="w-2/3 flex flex-col bg-slate-50/50">
                        {/* Added Items List */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-2">
                            <h4 className="text-sm font-semibold mb-4">Added Products</h4>
                            {loadingItems ? (
                                <div className="text-sm text-muted-foreground">Loading items...</div>
                            ) : items.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic">No products added yet.</div>
                            ) : (
                                items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm">
                                        <div>
                                            <div className="font-medium">{item.product?.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.quantity} {item.product?.base_unit}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Config button if bundle would go here */}
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Product Section */}
                        <div className="border-t bg-white p-4">
                            <h4 className="text-sm font-semibold mb-3">Add Compatible Product</h4>
                            <div className="space-y-3">
                                <input
                                    placeholder="Search products..."
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                                    {compatibleProducts.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-100 rounded text-sm group">
                                            <span>{p.name}</span>
                                            <Button size="sm" variant="secondary" className="h-7 opacity-0 group-hover:opacity-100" onClick={() => handleAddProduct(p)}>
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                    {compatibleProducts.length === 0 && (
                                        <div className="text-xs text-muted-foreground text-center py-2">
                                            No compatible products found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={handleSavePhase}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>

            <ProductConfigModal
                phaseId={phase.id}
                product={configProduct}
                open={!!configProduct}
                onOpenChange={(open) => !open && setConfigProduct(null)}
                onAdded={() => {
                    setConfigProduct(null)
                    loadItems()
                    router.refresh()
                }}
            />
        </Dialog>
    )
}
