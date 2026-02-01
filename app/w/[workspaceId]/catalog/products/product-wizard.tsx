'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/app/actions/catalog'
import { Loader2, ArrowRight, ArrowLeft, Save, Check, Plus, Trash2, X } from 'lucide-react'
import { ProductSelector } from './product-selector'
import { ResourceSelector } from './resource-selector'

// Types for complex state
type BundleComponent = {
    child_product_id: string
    product_name?: string
    quantity: number
    is_optional: boolean
    default_selected: boolean
    visibility_mode: 'always' | 'selected' | 'never'
    notes?: string
}

type BundleGroup = {
    name: string
    min_select: number
    max_select: number
    pricing_behavior: 'sum' | 'max' | 'fixed' // Simplified
    sort_order: number
    components: BundleComponent[]
}

type ResourceLink = {
    resource_id: string
    resource_name?: string
    unit?: string
    cost_per_unit?: number
    rule_type: 'fixed' | 'per_unit'
    quantity: number
    ratio_base?: number
    rounding_mode?: 'up' | 'down' | 'nearest'
    applies_to?: string[]
    notes?: string
}

type Props = {
    workspaceId: string
    settings: any // CatalogSettings
    categories: any[]
    phaseTypes: any[]
    initialData?: any // Product to edit
}

export function ProductWizard({ workspaceId, settings, categories, phaseTypes, initialData }: Props) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        sku: initialData?.sku || '',
        description: initialData?.description || '',
        category_id: initialData?.category_id || '',
        product_type: initialData?.product_type || 'single', // single, bundle, service
        base_price: initialData?.base_price || 0,
        pricing_mode: initialData?.pricing_mode || 'per_unit', // fixed, per_unit
        is_active: initialData?.is_active ?? true,
        phase_type_ids: initialData?.phase_type_ids || [] as string[],
        // Bundle State
        bundle_groups: initialData?.bundle_groups?.map((bg: any) => ({
            ...bg,
            // Ensure components are mapped if needed, though structure might match mostly.
            // UI expects 'product_name' which is in 'product.name' from DB
            components: bg.components?.map((c: any) => ({
                ...c,
                product_name: c.product?.name
            })) || []
        })) || [] as BundleGroup[],

        fixed_components: initialData?.fixed_components
            ?.filter((fc: any) => !fc.group_id) // Filter only true fixed components
            ?.map((fc: any) => ({
                ...fc,
                product_name: fc.product?.name
            })) || [] as BundleComponent[],

        // Resource State
        resources: initialData?.resources?.map((r: any) => ({
            resource_id: r.resource_id,
            resource_name: r.resource?.name,
            unit: r.resource?.unit,
            cost_per_unit: r.resource?.cost_per_unit,
            rule_type: r.rule_type,
            quantity: r.quantity,
            ratio_base: r.ratio_base,
            rounding_mode: r.rounding_mode,
            applies_to: r.applies_to,
            notes: r.notes
        })) || [] as ResourceLink[]
    })

    const totalSteps = 3 + (formData.product_type === 'bundle' && settings.bundles_enabled ? 1 : 0) + (settings.resources_enabled ? 1 : 0)

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps))
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handlePhaseToggle = (id: string) => {
        setFormData((prev: any) => {
            const current = new Set(prev.phase_type_ids)
            if (current.has(id)) current.delete(id)
            else current.add(id)
            return { ...prev, phase_type_ids: Array.from(current) }
        })
    }

    // --- Bundle Logic ---
    const addBundleGroup = () => {
        setFormData(prev => ({
            ...prev,
            bundle_groups: [...prev.bundle_groups, {
                name: 'New Group',
                min_select: 1,
                max_select: 1,
                pricing_behavior: 'sum',
                sort_order: prev.bundle_groups.length,
                components: []
            }]
        }))
    }

    const updateBundleGroup = (index: number, field: string, value: any) => {
        const newGroups = [...formData.bundle_groups]
        newGroups[index] = { ...newGroups[index], [field]: value }
        setFormData(prev => ({ ...prev, bundle_groups: newGroups }))
    }

    const removeBundleGroup = (index: number) => {
        const newGroups = [...formData.bundle_groups]
        newGroups.splice(index, 1)
        setFormData(prev => ({ ...prev, bundle_groups: newGroups }))
    }

    const addComponentToGroup = (groupIndex: number, product: any) => {
        const newGroups = [...formData.bundle_groups]
        newGroups[groupIndex].components.push({
            child_product_id: product.id,
            product_name: product.name,
            quantity: 1,
            is_optional: false,
            default_selected: false,
            visibility_mode: 'always'
        })
        setFormData(prev => ({ ...prev, bundle_groups: newGroups }))
    }

    const removeComponentFromGroup = (groupIndex: number, compIndex: number) => {
        const newGroups = [...formData.bundle_groups]
        newGroups[groupIndex].components.splice(compIndex, 1)
        setFormData(prev => ({ ...prev, bundle_groups: newGroups }))
    }


    // --- Resource Logic ---
    const addResource = (resource: any) => {
        setFormData(prev => ({
            ...prev,
            resources: [...prev.resources, {
                resource_id: resource.id,
                resource_name: resource.name,
                unit: resource.unit,
                cost_per_unit: resource.cost_per_unit,
                rule_type: 'per_unit',
                quantity: 1
            }]
        }))
    }

    const removeResource = (index: number) => {
        const newResources = [...formData.resources]
        newResources.splice(index, 1)
        setFormData(prev => ({ ...prev, resources: newResources }))
    }

    const updateResource = (index: number, field: string, value: any) => {
        const newResources = [...formData.resources]
        newResources[index] = { ...newResources[index], [field]: value }
        setFormData(prev => ({ ...prev, resources: newResources }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            let res
            if (initialData) {
                res = await updateProduct(initialData.id, formData)
            } else {
                res = await createProduct(formData)
            }

            if (res.success) {
                router.push(`/w/${workspaceId}/catalog/products`)
                router.refresh()
            } else {
                alert(res.message)
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Estimate total cost
    const totalResourceCost = formData.resources.reduce((acc, r) => {
        return acc + ((r.cost_per_unit || 0) * r.quantity)
    }, 0)

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{initialData ? 'Edit Product' : 'New Product'}</h1>
                    <span className="text-muted-foreground text-sm">Step {step} of {totalSteps}</span>
                </div>
                {/* Progress Bar */}
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Product Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="e.g. Premium Wedding Menu"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">SKU</label>
                                <input
                                    name="sku"
                                    value={formData.sku || ''}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="e.g. FD-001"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    name="product_type"
                                    value={formData.product_type}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="single">Single Item</option>
                                    {settings.bundles_enabled && <option value="bundle">Bundle / Pack</option>}
                                    <option value="service">Service</option>
                                </select>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold mb-4">Pricing Strategy</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Pricing Mode</label>
                                <select
                                    name="pricing_mode"
                                    value={formData.pricing_mode}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="per_unit">Per Unit (Standard)</option>
                                    <option value="fixed">Fixed Price</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Base Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        name="base_price"
                                        value={formData.base_price}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-semibold mb-4">Phase Compatibility</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {phaseTypes.map(pt => (
                                <div
                                    key={pt.id}
                                    onClick={() => handlePhaseToggle(pt.id)}
                                    className={`
                                        cursor-pointer border rounded-lg p-4 transition-all hover:bg-muted/50
                                        ${formData.phase_type_ids.includes(pt.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{pt.name}</span>
                                        {formData.phase_type_ids.includes(pt.id) && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{pt.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && formData.product_type === 'bundle' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Bundle Configuration</h2>
                            <button onClick={addBundleGroup} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Group
                            </button>
                        </div>

                        {formData.bundle_groups.length === 0 && (
                            <div className="text-center py-8 bg-muted/20 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">No bundle groups defined. Create groups to allow customers to choose items (e.g., "Main Course Selection").</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {formData.bundle_groups.map((group, groupIndex) => (
                                <div key={groupIndex} className="border rounded-lg p-4 space-y-4 bg-muted/10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="grid grid-cols-3 gap-4 flex-1">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Group Name</label>
                                                <input
                                                    value={group.name}
                                                    onChange={(e) => updateBundleGroup(groupIndex, 'name', e.target.value)}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    placeholder="Group Name"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Min Select</label>
                                                <input
                                                    type="number"
                                                    value={group.min_select}
                                                    onChange={(e) => updateBundleGroup(groupIndex, 'min_select', parseInt(e.target.value))}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Max Select</label>
                                                <input
                                                    type="number"
                                                    value={group.max_select}
                                                    onChange={(e) => updateBundleGroup(groupIndex, 'max_select', parseInt(e.target.value))}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                />
                                            </div>
                                        </div>
                                        <button onClick={() => removeBundleGroup(groupIndex)} className="text-muted-foreground hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="pl-4 border-l-2 border-muted-foreground/20 space-y-3">
                                        <div className="text-sm font-medium text-muted-foreground">Options in this group:</div>
                                        {group.components.map((comp, compIndex) => (
                                            <div key={compIndex} className="flex items-center gap-2 bg-background p-2 rounded border">
                                                <span className="flex-1 font-medium">{comp.product_name || 'Unknown Product'}</span>
                                                <span className="text-xs bg-muted px-2 py-1 rounded">Qty: {comp.quantity}</span>
                                                <button onClick={() => removeComponentFromGroup(groupIndex, compIndex)} className="text-muted-foreground hover:text-red-500">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="max-w-sm">
                                            <ProductSelector
                                                onSelect={(product) => addComponentToGroup(groupIndex, product)}
                                                excludedIds={group.components.map(c => c.child_product_id).concat([formData.name])} // primitive recursion check (by name lol, actually need ID but we don't have product ID yet unless editing)
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(step === 5 || (step === 4 && formData.product_type !== 'bundle')) && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Resources & Costing</h2>
                            <div className="text-sm font-medium bg-muted px-3 py-1 rounded-md">
                                Est. Total Cost: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalResourceCost)}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.resources.length === 0 && (
                                <div className="text-center py-8 bg-muted/20 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">No resources linked. Add ingredients, labor, or equipment to calculate costs.</p>
                                </div>
                            )}

                            {formData.resources.map((res, index) => (
                                <div key={index} className="flex items-center gap-4 border p-3 rounded-lg bg-card">
                                    <div className="flex-1">
                                        <div className="font-medium">{res.resource_name}</div>
                                        <div className="text-xs text-muted-foreground">{res.cost_per_unit} / {res.unit}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Qty</label>
                                        <input
                                            type="number"
                                            value={res.quantity}
                                            onChange={(e) => updateResource(index, 'quantity', parseFloat(e.target.value))}
                                            className="w-20 h-8 rounded-md border border-input px-2 text-sm"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>

                                    <div className="text-sm font-mono w-20 text-right">
                                        {(res.quantity * (res.cost_per_unit || 0)).toFixed(2)}
                                    </div>

                                    <button onClick={() => removeResource(index)} className="text-muted-foreground hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <div className="max-w-sm pt-4">
                                <label className="text-sm font-medium mb-1 block">Add Resource</label>
                                <ResourceSelector
                                    onSelect={addResource}
                                    excludedIds={formData.resources.map(r => r.resource_id)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-8">
                <button
                    onClick={handleBack}
                    disabled={step === 1 || loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {step === totalSteps ? (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Create Product
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-2 rounded-lg font-medium transition-all"
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
