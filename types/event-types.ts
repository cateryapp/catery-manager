export interface EventPhase {
    id: string
    event_id: string
    phase_type_id: string
    name_override: string | null
    sort_order: number
    items_count?: number
    phase_type?: {
        name: string
    }
    items?: EventPhaseItem[]
}

export interface EventPhaseItem {
    id: string
    event_phase_id: string
    product_id: string
    quantity: number
    quantity_source: string
    unit_price_override: number | null
    product?: {
        name: string
        base_unit: string
        pricing_mode: string
    }
}
