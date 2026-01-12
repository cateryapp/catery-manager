-- Rename table
ALTER TABLE public.profiles RENAME TO users;

-- Update the Trigger Function to insert into 'users' instead of 'profiles'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rename Policies for clarity
ALTER POLICY "Users can view their own profile" ON public.users RENAME TO "Users can view their own data";
ALTER POLICY "Users can update their own profile" ON public.users RENAME TO "Users can update their own data";
