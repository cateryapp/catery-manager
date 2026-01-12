SET search_path = "$user", public, extensions;

-- Create a test user: admin@catery.com / password
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'authenticated',
    'authenticated',
    'admin@catery.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Trigger creates the profile automatically

-- Create a Workspace
INSERT INTO public.workspaces (id, name, owner_id)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
    'Catery HQ', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
) ON CONFLICT (id) DO NOTHING;

-- Create Membership (since trigger won't fire for seed user)
INSERT INTO public.workspace_members (workspace_id, user_id, role)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'owner'
) ON CONFLICT DO NOTHING;
