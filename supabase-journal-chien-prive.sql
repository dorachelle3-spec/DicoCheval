create table if not exists public.dog_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date,
  dog text check (char_length(dog) <= 70),
  activity text check (char_length(activity) <= 100),
  mood text check (char_length(mood) <= 100),
  notes text not null check (char_length(notes) <= 5000),
  goal text check (char_length(goal) <= 1500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dog_journal_entries enable row level security;

drop policy if exists "dog journal read own" on public.dog_journal_entries;
drop policy if exists "dog journal insert own" on public.dog_journal_entries;
drop policy if exists "dog journal update own" on public.dog_journal_entries;
drop policy if exists "dog journal delete own" on public.dog_journal_entries;

create policy "dog journal read own" on public.dog_journal_entries for select to authenticated using (auth.uid() = user_id);
create policy "dog journal insert own" on public.dog_journal_entries for insert to authenticated with check (auth.uid() = user_id);
create policy "dog journal update own" on public.dog_journal_entries for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dog journal delete own" on public.dog_journal_entries for delete to authenticated using (auth.uid() = user_id);

create index if not exists dog_journal_entries_user_date_idx on public.dog_journal_entries (user_id, session_date desc, created_at desc);

create table if not exists public.dog_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_date date not null,
  event_time time,
  title text not null check (char_length(title) <= 120),
  event_type text not null check (char_length(event_type) <= 60),
  notes text check (char_length(notes) <= 1500),
  created_at timestamptz not null default now()
);

alter table public.dog_calendar_events enable row level security;
drop policy if exists "dog calendar read own" on public.dog_calendar_events;
drop policy if exists "dog calendar insert own" on public.dog_calendar_events;
drop policy if exists "dog calendar update own" on public.dog_calendar_events;
drop policy if exists "dog calendar delete own" on public.dog_calendar_events;
create policy "dog calendar read own" on public.dog_calendar_events for select to authenticated using (auth.uid() = user_id);
create policy "dog calendar insert own" on public.dog_calendar_events for insert to authenticated with check (auth.uid() = user_id);
create policy "dog calendar update own" on public.dog_calendar_events for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dog calendar delete own" on public.dog_calendar_events for delete to authenticated using (auth.uid() = user_id);
create index if not exists dog_calendar_events_user_date_idx on public.dog_calendar_events (user_id, event_date, event_time);
