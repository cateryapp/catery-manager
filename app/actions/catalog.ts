'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResponse = {
    success: boolean
    message: string
    data?: any
    error?: any
}

// Helper to get workspace_id
async function getWorkspaceId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Ideally, we get the active workspace from a cookie or context.
    // For now, we'll fetch the first workspace the user is a member of.
    // In a real app, you'd select the active workspace.
    const { data: members } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

    if (!members) throw new Error('No workspace found')
    return members.workspace_id
}

// --- PHASE TYPES ---

export async function getPhaseTypes() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('phase_types').select('*').order('name')
    if (error) throw new Error(error.message)
    return data
}

export async function createPhaseType(formData: FormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()
        const name = formData.get('name') as string
        const description = formData.get('description') as string

        const { error } = await supabase.from('phase_types').insert({
            workspace_id,
            name,
            description,
        })

        if (error) throw error
        revalidatePath('/dashboard/catalog/phases')
        return { success: true, message: 'Phase type created successfully' }
    } catch (error: any) {
        return { success: false, message: error.message, error }
    }
}

export async function updatePhaseType(id: string, formData: FormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const is_active = formData.get('is_active') === 'on'

        const { error } = await supabase.from('phase_types').update({
            name,
            description,
            is_active
        }).eq('id', id)

        if (error) throw error
        revalidatePath('/dashboard/catalog/phases')
        return { success: true, message: 'Phase type updated successfully' }
    } catch (error: any) {
        return { success: false, message: error.message, error }
    }
}

export async function deletePhaseType(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('phase_types').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/catalog/phases')
        return { success: true, message: 'Phase type deleted successfully' }
    } catch (error: any) {
        return { success: false, message: error.message, error }
    }
}

// --- CATEGORIES ---

export async function getCategories() {
    const supabase = await createClient()
    // Fetch categories. We might want to construct a tree client-side.
    const { data, error } = await supabase.from('product_categories').select('*').order('name')
    if (error) throw new Error(error.message)
    return data
}

export async function createCategory(formData: FormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()
        const name = formData.get('name') as string
        const parent_category_id = formData.get('parent_category_id') as string || null

        const { error } = await supabase.from('product_categories').insert({
            workspace_id,
            name,
            parent_category_id: parent_category_id ? parent_category_id : null
        })

        if (error) throw error
        revalidatePath('/dashboard/catalog/categories')
        return { success: true, message: 'Category created successfully' }
    } catch (error: any) {
        return { success: false, message: error.message, error }
    }
}

// --- PRODUCTS ---

export async function getProducts(filters?: any) {
    const supabase = await createClient()
    let query = supabase.from('products').select(`
        *,
        category:product_categories(name),
        phase_types:phase_type_products(phase_type_id)
    `)

    // Apply filters if needed
    if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query.order('name')
    if (error) throw new Error(error.message)
    return data
}

export async function createProduct(data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        // 1. Create Product
        const { data: product, error } = await supabase.from('products').insert({
            workspace_id,
            name: data.name,
            description: data.description,
            sku: data.sku,
            category_id: data.category_id || null,
            product_type: data.product_type,
            product_role: data.product_role,
            is_active: data.is_active,
            visibility: data.visibility,
            base_unit: data.base_unit,
            pricing_mode: data.pricing_mode,
            base_price: data.base_price,
            tax_rate: data.tax_rate,
            default_quantity_source: data.default_quantity_source,
            image_url: data.image_url
        }).select().single()

        if (error) throw error

        // 2. Link compability phase types
        if (data.phase_type_ids && data.phase_type_ids.length > 0) {
            const links = data.phase_type_ids.filter((id: string) => id).map((id: string) => ({
                workspace_id,
                phase_type_id: id,
                product_id: product.id
            }))
            const { error: linkError } = await supabase.from('phase_type_products').insert(links)
            if (linkError) throw linkError
        }

        // 3. Handle Bundles
        if (data.product_type === 'bundle' && data.bundle_groups && data.bundle_groups.length > 0) {
            for (const group of data.bundle_groups) {
                // Create Group
                const { data: newGroup, error: groupError } = await supabase.from('bundle_groups').insert({
                    workspace_id,
                    parent_product_id: product.id,
                    name: group.name,
                    min_select: group.min_select,
                    max_select: group.max_select,
                    pricing_behavior: group.pricing_behavior,
                    sort_order: group.sort_order
                }).select().single()

                if (groupError) throw groupError

                // Add components to group
                if (group.components && group.components.length > 0) {
                    const components = group.components.map((comp: any) => ({
                        workspace_id,
                        parent_product_id: product.id,
                        child_product_id: comp.child_product_id,
                        group_id: newGroup.id,
                        quantity: comp.quantity,
                        is_optional: comp.is_optional,
                        default_selected: comp.default_selected,
                        visibility_mode: comp.visibility_mode,
                        notes: comp.notes
                    }))
                    const { error: compError } = await supabase.from('product_components').insert(components)
                    if (compError) throw compError
                }
            }
        }
        // Handle fixed components (no group)
        if (data.product_type === 'bundle' && data.fixed_components && data.fixed_components.length > 0) {
            const components = data.fixed_components.map((comp: any) => ({
                workspace_id,
                parent_product_id: product.id,
                child_product_id: comp.child_product_id,
                group_id: null,
                quantity: comp.quantity,
                is_optional: false,
                default_selected: true,
                visibility_mode: comp.visibility_mode || 'both',
                notes: comp.notes
            }))
            const { error: compError } = await supabase.from('product_components').insert(components)
            if (compError) throw compError
        }


        // 4. Handle Resources
        if (data.resources && data.resources.length > 0) {
            const resources = data.resources.map((res: any) => ({
                workspace_id,
                product_id: product.id,
                resource_id: res.resource_id,
                rule_type: res.rule_type,
                quantity: res.quantity,
                ratio_base: res.ratio_base,
                rounding_mode: res.rounding_mode,
                applies_to: res.applies_to,
                notes: res.notes
            }))
            const { error: resError } = await supabase.from('product_resources').insert(resources)
            if (resError) throw resError
        }

        revalidatePath('/dashboard/catalog/products')
        return { success: true, message: 'Product created successfully', data: product }

    } catch (error: any) {
        // Rollback? Supabase HTTP API doesn't support easy rollback without RPC. 
        // We might leave an orphan product. Ideally usage of RPC or strict validation before insert.
        return { success: false, message: error.message, error }
    }
}

export async function getProduct(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            category:product_categories(*),
            phase_links:phase_type_products(phase_type_id),
            bundle_groups:bundle_groups(
                *,
                components:product_components(
                    *,
                    product:products!product_components_child_product_id_fkey(name)
                )
            ),
            fixed_components:product_components(
                *,
                product:products!product_components_child_product_id_fkey(name)
            ),
            resources:product_resources(
                *,
                resource:resources(*)
            )
        `)
        .eq('id', id)
        .single()

    if (error) throw new Error(error.message)

    // Transform for Wizard
    const phase_type_ids = data.phase_links.map((l: any) => l.phase_type_id)

    // Filter fixed components (where group_id is null)
    // The query above fetches all components for bundle_groups because of the relation, but we also fetched ALL components as 'fixed_components'? 
    // No, 'fixed_components:product_components' fetches ALL components for the parent. We need to filter in JS or use specific filtering in query if possible.
    // Supabase filtering on nested resource is possible.

    // Actually, let's just fetch all components and split them in JS.
    // Simplifying the query to just fetch components and groups.

    return {
        ...data,
        phase_type_ids,
        // The detailed transformation will happen in the component or here if we want strictly matching types.
        // For now, returning data. 
    }
}

export async function updateProduct(id: string, data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        // 1. Update Product Base
        const { error } = await supabase.from('products').update({
            name: data.name,
            description: data.description,
            sku: data.sku,
            category_id: data.category_id || null,
            product_type: data.product_type,
            product_role: data.product_role,
            is_active: data.is_active,
            visibility: data.visibility,
            base_unit: data.base_unit,
            pricing_mode: data.pricing_mode,
            base_price: data.base_price,
            tax_rate: data.tax_rate,
            default_quantity_source: data.default_quantity_source,
            image_url: data.image_url
        }).eq('id', id)

        if (error) throw error

        // 2. Update Phase Links (Delete all and re-insert)
        await supabase.from('phase_type_products').delete().eq('product_id', id)
        if (data.phase_type_ids && data.phase_type_ids.length > 0) {
            const links = data.phase_type_ids.filter((pid: string) => pid).map((pid: string) => ({
                workspace_id,
                phase_type_id: pid,
                product_id: id
            }))
            await supabase.from('phase_type_products').insert(links)
        }

        // 3. Update Bundles (Delete all groups/components and re-insert)
        // This is destructive but safe for consistency if we trust the input `data` is complete.
        if (data.product_type === 'bundle') {
            // Delete existing groups (cascade should delete components? check schema)
            // If schema has ON DELETE CASCADE, deleting groups deletes components in them.
            // Fixed components (null group) need explicit delete.

            // Delete all components (fixed and grouped)
            await supabase.from('product_components').delete().eq('parent_product_id', id)
            // Delete all groups
            await supabase.from('bundle_groups').delete().eq('parent_product_id', id)

            // Re-insert Groups and Components
            if (data.bundle_groups && data.bundle_groups.length > 0) {
                for (const group of data.bundle_groups) {
                    const { data: newGroup, error: groupError } = await supabase.from('bundle_groups').insert({
                        workspace_id,
                        parent_product_id: id,
                        name: group.name,
                        min_select: group.min_select,
                        max_select: group.max_select,
                        pricing_behavior: group.pricing_behavior,
                        sort_order: group.sort_order
                    }).select().single()

                    if (groupError) throw groupError

                    if (group.components && group.components.length > 0) {
                        const components = group.components.map((comp: any) => ({
                            workspace_id,
                            parent_product_id: id,
                            child_product_id: comp.child_product_id,
                            group_id: newGroup.id,
                            quantity: comp.quantity,
                            is_optional: comp.is_optional,
                            default_selected: comp.default_selected,
                            visibility_mode: comp.visibility_mode,
                            notes: comp.notes
                        }))
                        await supabase.from('product_components').insert(components)
                    }
                }
            }
        }

        // 4. Update Resources (Delete all and re-insert)
        await supabase.from('product_resources').delete().eq('product_id', id)
        if (data.resources && data.resources.length > 0) {
            const resources = data.resources.map((res: any) => ({
                workspace_id,
                product_id: id,
                resource_id: res.resource_id,
                rule_type: res.rule_type,
                quantity: res.quantity,
                ratio_base: res.ratio_base,
                rounding_mode: res.rounding_mode,
                applies_to: res.applies_to,
                notes: res.notes
            }))
            await supabase.from('product_resources').insert(resources)
        }

        revalidatePath('/dashboard/catalog/products')
        return { success: true, message: 'Product updated successfully' }

    } catch (error: any) {
        return { success: false, message: error.message, error }
    }
}

// --- BUNDLES ---

export async function getProductBundleDefinition(productId: string) {
    const supabase = await createClient()

    // 1. Get groups
    const { data: groups, error: groupsError } = await supabase
        .from('bundle_groups')
        .select('*')
        .eq('parent_product_id', productId)
        .order('sort_order')

    if (groupsError) throw new Error(groupsError.message)

    // 2. Get all components for this product
    const { data: components, error: componentsError } = await supabase
        .from('product_components')
        .select(`
            *,
            product:products!product_components_child_product_id_fkey(name, sku, product_type)
        `)
        .eq('parent_product_id', productId)

    if (componentsError) throw new Error(componentsError.message)

    return { groups, components }
}

export async function createBundleGroup(productId: string, data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        const { error } = await supabase.from('bundle_groups').insert({
            workspace_id,
            parent_product_id: productId,
            name: data.name,
            min_select: data.min_select,
            max_select: data.max_select,
            pricing_behavior: data.pricing_behavior,
            sort_order: data.sort_order
        })

        if (error) throw new Error(error.message)
        revalidatePath(`/dashboard/catalog/products/${productId}`)
        return { success: true, message: 'Group created' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function addComponentToBundle(productId: string, data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        const { error } = await supabase.from('product_components').insert({
            workspace_id,
            parent_product_id: productId,
            child_product_id: data.child_product_id,
            group_id: data.group_id || null, // null for fixed components
            quantity: data.quantity,
            is_optional: data.is_optional,
            default_selected: data.default_selected,
            visibility_mode: data.visibility_mode,
            notes: data.notes
        })

        if (error) throw new Error(error.message)
        revalidatePath(`/dashboard/catalog/products/${productId}`)
        return { success: true, message: 'Component added' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

// --- RESOURCES ---

export async function getResources() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('resources').select('*').order('name')
    if (error) throw new Error(error.message)
    return data
}

export async function createResource(data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        const { error } = await supabase.from('resources').insert({
            workspace_id,
            name: data.name,
            resource_type: data.resource_type,
            unit: data.unit,
            cost_per_unit: data.cost_per_unit,
            is_reusable: data.is_reusable,
            is_active: data.is_active
        })

        if (error) throw new Error(error.message)
        revalidatePath('/dashboard/catalog/resources')
        return { success: true, message: 'Resource created' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function updateResource(id: string, data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('resources').update({
            name: data.name,
            resource_type: data.resource_type,
            unit: data.unit,
            cost_per_unit: data.cost_per_unit,
            is_reusable: data.is_reusable,
            is_active: data.is_active
        }).eq('id', id)

        if (error) throw new Error(error.message)
        revalidatePath('/dashboard/catalog/resources')
        return { success: true, message: 'Resource updated' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function linkResourceToProduct(productId: string, data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        const { error } = await supabase.from('product_resources').insert({
            workspace_id,
            product_id: productId,
            resource_id: data.resource_id,
            rule_type: data.rule_type,
            quantity: data.quantity,
            ratio_base: data.ratio_base,
            rounding_mode: data.rounding_mode,
            applies_to: data.applies_to,
            notes: data.notes
        })

        if (error) throw new Error(error.message)
        revalidatePath(`/dashboard/catalog/products/${productId}`)
        return { success: true, message: 'Resource linked' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function getProductResources(productId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('product_resources')
        .select(`
            *,
            resource:resources(*)
        `)
        .eq('product_id', productId)

    if (error) throw new Error(error.message)
    return data
}

// --- SETTINGS ---

export async function getCatalogSettings() {
    const supabase = await createClient()
    const workspace_id = await getWorkspaceId()

    const { data, error } = await supabase
        .from('workspace_configs')
        .select('value')
        .eq('workspace_id', workspace_id)
        .eq('key', 'catalog_settings')
        .single()

    // Default settings if not found
    if (error && error.code === 'PGRST116') {
        return {
            advanced_enabled: true,
            bundles_enabled: true,
            resources_enabled: false,
            costing_enabled: false,
            pricing_advanced_enabled: true
        }
    }

    if (error) {
        console.error('Error fetching settings:', error)
        return {
            advanced_enabled: true,
            bundles_enabled: true,
            resources_enabled: false,
            costing_enabled: false,
            pricing_advanced_enabled: true
        }
    }

    return data?.value
}

export async function updateCatalogSettings(settings: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        const { error } = await supabase
            .from('workspace_configs')
            .upsert({
                workspace_id,
                key: 'catalog_settings',
                value: settings
            }, { onConflict: 'workspace_id,key' })

        if (error) throw error

        revalidatePath('/dashboard/catalog')
        return { success: true, message: 'Settings updated' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}
