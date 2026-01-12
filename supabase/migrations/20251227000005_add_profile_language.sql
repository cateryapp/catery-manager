-- Add language column to profiles
alter table profiles 
add column language text default 'en' check (language in ('en', 'es', 'pt'));
