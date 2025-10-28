-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic admin policy
drop policy if exists "Admins can view all profiles" on public.profiles;

-- Create new admin policy using JWT claims instead of querying profiles table
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
