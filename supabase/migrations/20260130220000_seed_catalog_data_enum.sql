-- Add 'staff' to resource_type if missing
ALTER TYPE public.resource_type ADD VALUE IF NOT EXISTS 'staff';
