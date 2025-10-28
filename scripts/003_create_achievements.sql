-- Create achievements table for different types of achievements
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('academic', 'sports', 'cultural', 'technical', 'social_service', 'other')),
  description text,
  max_points integer not null default 10,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.achievements enable row level security;

-- RLS Policies for achievements
create policy "Anyone can view achievements"
  on public.achievements for select
  using (true);

create policy "Only admins can insert achievements"
  on public.achievements for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can update achievements"
  on public.achievements for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can delete achievements"
  on public.achievements for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create index for faster lookups
create index if not exists achievements_category_idx on public.achievements(category);

-- Insert some default achievements
insert into public.achievements (name, category, description, max_points) values
  ('First Class/Distinction', 'academic', 'Academic excellence in previous semester/year', 10),
  ('Research Paper Publication', 'academic', 'Published research paper in recognized journal', 15),
  ('University Level Sports', 'sports', 'Participation/winning in university level sports', 10),
  ('State/National Level Sports', 'sports', 'Participation/winning in state or national level sports', 20),
  ('Cultural Event Winner', 'cultural', 'Winner in cultural events at college/university level', 8),
  ('Hackathon Winner', 'technical', 'Winner in technical hackathons', 12),
  ('Technical Certification', 'technical', 'Completed industry-recognized technical certification', 8),
  ('Social Service', 'social_service', 'Participation in social service activities (NSS, NCC, etc.)', 10),
  ('Leadership Position', 'other', 'Held leadership position in student organizations', 10)
on conflict do nothing;
