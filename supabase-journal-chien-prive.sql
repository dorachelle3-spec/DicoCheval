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
