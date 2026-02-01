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
import { Label } from '@/components/ui/label'
import { getProductBundleDefinition } from '@/app/actions/catalog'
import { addEventPhaseItem, saveItemConfiguration } from '@/app/actions/event-items'
import { useRouter } from 'next/navigation'
import { Minus, Plus } from 'lucide-react'

interface ProductConfigModalProps {
    phaseId: string
    product: any | null // The bundle product to add
    open: boolean
    onOpenChange: (open: boolean) => void
    onAdded?: () => void
}

export function ProductConfigModal({ phaseId, product, open, onOpenChange, onAdded }: ProductConfigModalProps) {
    const [loading, setLoading] = useState(false)
    const [definition, setDefinition] = useState<{ groups: any[], components: any[] } | null>(null)
    const [selections, setSelections] = useState<Record<string, number>>({}) // componentId -> quantity
    const router = useRouter()

    useEffect(() => {
        if (product && open) {
            loadDefinition()
        }
    }, [product, open])

    async function loadDefinition() {
        if (!product) return
        setLoading(true)
        try {
            const def = await getProductBundleDefinition(product.id)
            setDefinition(def)

            // Initialize default selections
            const initial: Record<string, number> = {}
            def.components.forEach((c: any) => {
                if (c.default_selected) {
                    initial[c.child_product_id] = Number(c.quantity)
                }
            })
            setSelections(initial)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    function updateSelection(childId: string, delta: number, max?: number) {
        setSelections(prev => {
            const current = prev[childId] || 0
            let next = current + delta
            if (next < 0) next = 0
            // if (max && next > max) next = max // Max logic depends on group total usually
            return { ...prev, [childId]: next }
        })
    }

    // Validation logic
    function getValidationErrors() {
        if (!definition) return []
        const errors: string[] = []

        definition.groups.forEach(group => {
            const groupComponents = definition.components.filter(c => c.group_id === group.id)
            const totalSelected = groupComponents.reduce((sum, c) => sum + (selections[c.child_product_id] || 0), 0)

            if (group.min_select && totalSelected < group.min_select) {
                errors.push(`${group.name}: Select at least ${group.min_select}`)
            }
            if (group.max_select && totalSelected > group.max_select) {
                errors.push(`${group.name}: Select at most ${group.max_select}`)
            }
        })

        return errors
    }

    async function handleConfirm() {
        if (!product) return
        const errors = getValidationErrors()
        if (errors.length > 0) {
            alert(errors.join('\n'))
            return
        }

        setLoading(true)
        // 1. Add item
        const res = await addEventPhaseItem(phaseId, product.id)
        if (!res.success) {
            alert('Failed to add item')
            setLoading(false)
            return
        }

        // 2. Save config
        if (Object.keys(selections).length > 0) {
            const itemId = res.data.id
            const componentsToSave = []

            // Map selections to components
            // We need to find the component definition to get group_id etc.
            if (definition) {
                for (const [childId, qty] of Object.entries(selections)) {
                    if (qty > 0) {
                        const compDef = definition.components.find(c => c.child_product_id === childId)
                        if (compDef) {
                            componentsToSave.push({
                                component_product_id: childId,
                                group_id: compDef.group_id,
                                quantity: qty,
                                selected: true
                            })
                        }
                    }
                }

                if (componentsToSave.length > 0) {
                    await saveItemConfiguration(itemId, componentsToSave)
                }
            }
        }

        setLoading(false)
        onOpenChange(false)
        if (onAdded) onAdded()
    }

    if (!product) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configure {product.name}</DialogTitle>
                </DialogHeader>

                {loading && !definition ? (
                    <div className="py-8 text-center">Loading configuration...</div>
                ) : definition ? (
                    <div className="space-y-6 py-4">
                        {definition.groups.map(group => {
                            const groupComponents = definition.components.filter(c => c.group_id === group.id)
                            const currentTotal = groupComponents.reduce((sum, c) => sum + (selections[c.child_product_id] || 0), 0)

                            return (
                                <div key={group.id} className="space-y-3 border p-4 rounded-lg">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-semibold">{group.name}</h4>
                                        <span className="text-sm text-muted-foreground">
                                            {currentTotal} / {group.max_select || '∞'} (Min: {group.min_select})
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {groupComponents.map((comp: any) => {
                                            const qty = selections[comp.child_product_id] || 0
                                            return (
                                                <div key={comp.id} className="flex items-center justify-between text-sm">
                                                    <span>{comp.product.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            variant="outline" size="icon" className="h-6 w-6"
                                                            onClick={() => updateSelection(comp.child_product_id, -1)}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <span className="w-4 text-center">{qty}</span>
                                                        <Button
                                                            variant="outline" size="icon" className="h-6 w-6"
                                                            onClick={() => updateSelection(comp.child_product_id, 1)}
                                                            disabled={Boolean(group.max_select && currentTotal >= group.max_select && qty === 0)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : null}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={loading}>
                        Add to Event
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
