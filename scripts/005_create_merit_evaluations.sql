-- Create merit evaluations table for calculated merit scores
create table if not exists public.merit_evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  academic_year text not null,
  semester text not null,
  total_points integer not null default 0,
  rank integer,
  percentile numeric(5,2),
  evaluation_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(student_id, academic_year, semester)
);

-- Enable RLS
alter table public.merit_evaluations enable row level security;

-- RLS Policies for merit evaluations
create policy "Students can view their own merit evaluation"
  on public.merit_evaluations for select
  using (auth.uid() = student_id);

create policy "Admins can view all merit evaluations"
  on public.merit_evaluations for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert merit evaluations"
  on public.merit_evaluations for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update merit evaluations"
  on public.merit_evaluations for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes for faster lookups
create index if not exists merit_evaluations_student_id_idx on public.merit_evaluations(student_id);
create index if not exists merit_evaluations_academic_year_idx on public.merit_evaluations(academic_year);
create index if not exists merit_evaluations_rank_idx on public.merit_evaluations(rank);
