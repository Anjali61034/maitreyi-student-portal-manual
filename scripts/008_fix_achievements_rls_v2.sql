-- Fix infinite recursion in achievements RLS policies
-- Drop the problematic admin policies
drop policy if exists "Only admins can insert achievements" on public.achievements;
drop policy if exists "Only admins can update achievements" on public.achievements;
drop policy if exists "Only admins can delete achievements" on public.achievements;

-- Create new admin policies using JWT claims instead of querying profiles table
create policy "Only admins can insert achievements"
  on public.achievements for insert
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Only admins can update achievements"
  on public.achievements for update
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Only admins can delete achievements"
  on public.achievements for delete
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
