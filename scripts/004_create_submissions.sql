-- Create submissions table for student achievement submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  title text not null,
  description text not null,
  proof_url text,
  proof_file_name text,
  achievement_date date not null,
  points_awarded integer,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_remarks text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.submissions enable row level security;

-- RLS Policies for submissions
create policy "Students can view their own submissions"
  on public.submissions for select
  using (auth.uid() = student_id);

create policy "Students can insert their own submissions"
  on public.submissions for insert
  with check (auth.uid() = student_id);

create policy "Students can update their own pending submissions"
  on public.submissions for update
  using (auth.uid() = student_id and status = 'pending');

create policy "Students can delete their own pending submissions"
  on public.submissions for delete
  using (auth.uid() = student_id and status = 'pending');

create policy "Admins can view all submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all submissions"
  on public.submissions for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes for faster lookups
create index if not exists submissions_student_id_idx on public.submissions(student_id);
create index if not exists submissions_achievement_id_idx on public.submissions(achievement_id);
create index if not exists submissions_status_idx on public.submissions(status);
create index if not exists submissions_created_at_idx on public.submissions(created_at desc);
