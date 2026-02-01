-- Add default workspace settings
INSERT INTO public.workspace_configs (workspace_id, key, value)
SELECT 
    id as workspace_id,
    'catalog_settings',
    '{"advanced_enabled": true, "bundles_enabled": true, "resources_enabled": true, "costing_enabled": true, "pricing_advanced_enabled": true}'::jsonb
FROM public.workspaces
ON CONFLICT (workspace_id, key) DO NOTHING;

-- Add default Phase Types
INSERT INTO public.phase_types (workspace_id, name, description, is_active)
SELECT 
    id as workspace_id,
    phase_name,
    phase_desc,
    true
FROM public.workspaces,
(VALUES 
    ('Reception / Cocktail', 'Review of appetizers and drinks before seated meal.'),
    ('Banquet / Main Course', 'Seated meal service.'),
    ('Open Bar / Party', 'Late night drinks and snacks.'),
    ('Staff Meal', 'Internal phase for staff breaks.')
) as t(phase_name, phase_desc)
WHERE NOT EXISTS (
    SELECT 1 FROM public.phase_types pt 
    WHERE pt.workspace_id = workspaces.id AND pt.name = t.phase_name
);

-- Add default Categories
INSERT INTO public.product_categories (workspace_id, name)
SELECT 
    id as workspace_id,
    cat_name
FROM public.workspaces,
(VALUES 
    ('Food'),
    ('Beverage'),
    ('Equipment'),
    ('Staff'),
    ('Venue')
) as t(cat_name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.product_categories pc 
    WHERE pc.workspace_id = workspaces.id AND pc.name = t.cat_name
);

-- Add default Resources (Ingredients / Staff Roles)
-- Note: Simplified. In real app, might want specific resource types.
INSERT INTO public.resources (workspace_id, name, resource_type, unit, cost_per_unit, is_reusable, is_active)
SELECT 
    id as workspace_id,
    r_name,
    r_type::public.resource_type,
    r_unit::public.resource_unit,
    r_cost,
    r_reusable,
    true
FROM public.workspaces,
(VALUES 
    ('Waiter', 'staff', 'hour', 15.00, true),
    ('Head Chef', 'staff', 'hour', 25.00, true),
    ('Plate (Standard)', 'equipment', 'unit', 2.00, true),
    ('Wine Glass', 'equipment', 'unit', 1.50, true),
    ('Napkin (Linen)', 'equipment', 'unit', 0.50, true),
    ('Ice', 'ingredient', 'kg', 0.50, false)
) as t(r_name, r_type, r_unit, r_cost, r_reusable)
WHERE NOT EXISTS (
    SELECT 1 FROM public.resources r 
    WHERE r.workspace_id = workspaces.id AND r.name = t.r_name
);
