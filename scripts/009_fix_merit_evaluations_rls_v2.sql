-- Fix infinite recursion in merit_evaluations RLS policies
-- Drop the problematic admin policies
drop policy if exists "Admins can view all merit evaluations" on public.merit_evaluations;
drop policy if exists "Admins can insert merit evaluations" on public.merit_evaluations;
drop policy if exists "Admins can update merit evaluations" on public.merit_evaluations;

-- Create new admin policies using JWT claims instead of querying profiles table
create policy "Admins can view all merit evaluations"
  on public.merit_evaluations for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can insert merit evaluations"
  on public.merit_evaluations for insert
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can update merit evaluations"
  on public.merit_evaluations for update
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
