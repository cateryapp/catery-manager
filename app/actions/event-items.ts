'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResponse } from './event-phases'

// Helper to get workspace_id
async function getWorkspaceId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: members } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

    if (!members) throw new Error('No workspace found')
    return members.workspace_id
}

export async function getEventPhaseItems(phaseId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('event_phase_items')
        .select(`
            *,
            product:products(
                name, 
                base_unit, 
                pricing_mode,
                product_type,
                base_price
            ),
            components:event_phase_item_components(*)
        `)
        .eq('event_phase_id', phaseId)
        .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function addEventPhaseItem(phaseId: string, productId: string, data: any = {}): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        const { data: item, error } = await supabase.from('event_phase_items').insert({
            workspace_id,
            event_phase_id: phaseId,
            product_id: productId,
            quantity: data.quantity || 1,
            quantity_source: data.quantity_source || 'manual', // or guests
            unit_price_override: data.unit_price_override || null,
            pricing_mode_override: data.pricing_mode_override || null
        }).select().single()

        if (error) throw error
        return { success: true, message: 'Product added', data: item }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function updateEventPhaseItem(itemId: string, data: any): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('event_phase_items')
            .update({
                quantity: data.quantity,
                unit_price_override: data.unit_price_override,
                notes: data.notes
            })
            .eq('id', itemId)

        if (error) throw error
        return { success: true, message: 'Item updated' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function deleteEventPhaseItem(itemId: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('event_phase_items').delete().eq('id', itemId)
        if (error) throw error
        return { success: true, message: 'Item removed' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

// Bundle Configuration
export async function saveItemConfiguration(itemId: string, components: any[]): Promise<ActionResponse> {
    try {
        const supabase = await createClient()
        const workspace_id = await getWorkspaceId()

        // Delete existing components (full rewrite for now)
        await supabase.from('event_phase_item_components').delete().eq('event_phase_item_id', itemId)

        if (components && components.length > 0) {
            const inserts = components.map(c => ({
                workspace_id,
                event_phase_item_id: itemId,
                component_product_id: c.component_product_id,
                group_id: c.group_id,
                quantity: c.quantity,
                selected: c.selected
            }))

            const { error } = await supabase.from('event_phase_item_components').insert(inserts)
            if (error) throw error
        }

        return { success: true, message: 'Configuration saved' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function getCompatibleProducts(phaseTypeId: string, search?: string) {
    const supabase = await createClient()

    // We need to join products with phase_type_products
    // Supabase JS doesn't support complex joins easily for filtering on joined table with simple syntax sometimes.
    // But we can filter by querying phase_type_products and then products.

    // 1. Get compatible product IDs
    const { data: links } = await supabase
        .from('phase_type_products')
        .select('product_id')
        .eq('phase_type_id', phaseTypeId)

    const productIds = links?.map(l => l.product_id) || []

    if (productIds.length === 0) return []

    // 2. Fetch products
    let query = supabase
        .from('products')
        .select(`
            *,
            category:product_categories(name)
        `)
        .in('id', productIds)
        .eq('is_active', true)
    // .in('product_role', ['sellable', 'both']) // Enum handling might need casting or string check

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query.order('name')
    if (error) throw error

    return data.filter(p => p.product_role !== 'component') // Client side filter for role if enum is tricky
}
