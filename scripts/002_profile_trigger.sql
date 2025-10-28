-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, student_id, department, year_of_study, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'student_id', null),
    coalesce(new.raw_user_meta_data->>'department', null),
    coalesce((new.raw_user_meta_data->>'year_of_study')::integer, null),
    coalesce(new.raw_user_meta_data->>'phone', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger to auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
