-- Fix infinite recursion in submissions RLS policies
-- Drop the problematic admin policies
drop policy if exists "Admins can view all submissions" on public.submissions;
drop policy if exists "Admins can update all submissions" on public.submissions;

-- Create new admin policies using JWT claims instead of querying profiles table
create policy "Admins can view all submissions"
  on public.submissions for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can update all submissions"
  on public.submissions for update
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
