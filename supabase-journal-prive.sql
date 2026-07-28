-- DicoCheval : journal équestre strictement privé par compte.
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date,
  horse text check (char_length(horse) <= 70),
  activity text check (char_length(activity) <= 80),
  mood text check (char_length(mood) <= 50),
  notes text not null check (char_length(notes) <= 10000),
  goal text check (char_length(goal) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

drop policy if exists "Journal prive lecture" on public.journal_entries;
drop policy if exists "Journal prive ajout" on public.journal_entries;
drop policy if exists "Journal prive modification" on public.journal_entries;
drop policy if exists "Journal prive suppression" on public.journal_entries;

create policy "Journal prive lecture" on public.journal_entries
for select to authenticated using (user_id = auth.uid());

create policy "Journal prive ajout" on public.journal_entries
for insert to authenticated with check (user_id = auth.uid());

create policy "Journal prive modification" on public.journal_entries
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Journal prive suppression" on public.journal_entries
for delete to authenticated using (user_id = auth.uid());
