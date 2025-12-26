-- Core game tables for Elephant Puzzle
create table if not exists games (
  id text primary key,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists players (
  id text primary key,
  game_id text references games(id) on delete cascade,
  name text not null,
  role text check (role in ('player','gm')) default 'player',
  joined_at timestamptz default now()
);

create table if not exists puzzle_pieces (
  id text primary key,
  game_id text references games(id) on delete cascade,
  text text,
  author text,
  phase text,
  kind text check (kind in ('quote','title','user-entry')) default 'quote'
);

create table if not exists placements (
  id uuid primary key default gen_random_uuid(),
  game_id text references games(id) on delete cascade,
  player_id text references players(id) on delete cascade,
  piece_id text references puzzle_pieces(id),
  phase text,
  kind text check (kind in ('quote','title')),
  updated_at timestamptz default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  game_id text references games(id) on delete cascade,
  player_id text references players(id) on delete cascade,
  name text,
  score integer,
  time_ms integer,
  created_at timestamptz default now()
);

create index if not exists idx_placements_game on placements(game_id);
create index if not exists idx_scores_game on scores(game_id);

-- Enable Row Level Security (RLS)
alter table games enable row level security;
alter table players enable row level security;
alter table placements enable row level security;
alter table scores enable row level security;
alter table puzzle_pieces enable row level security;

-- RLS Policies: Allow all operations for now (can be restricted later)
-- Games: Anyone can read/write
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'games' 
    and policyname = 'Games are public'
  ) then
    create policy "Games are public" on games for all using (true) with check (true);
  end if;
end $$;

-- Players: Anyone can read/write
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'players' 
    and policyname = 'Players are public'
  ) then
    create policy "Players are public" on players for all using (true) with check (true);
  end if;
end $$;

-- Placements: Anyone can read/write
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'placements' 
    and policyname = 'Placements are public'
  ) then
    create policy "Placements are public" on placements for all using (true) with check (true);
  end if;
end $$;

-- Scores: Anyone can read/write
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'scores' 
    and policyname = 'Scores are public'
  ) then
    create policy "Scores are public" on scores for all using (true) with check (true);
  end if;
end $$;

-- Puzzle pieces: Anyone can read/write
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'puzzle_pieces' 
    and policyname = 'Puzzle pieces are public'
  ) then
    create policy "Puzzle pieces are public" on puzzle_pieces for all using (true) with check (true);
  end if;
end $$;

-- Note: Realtime replication is skipped (requires invitation)
-- To enable later: Database > Replication > Enable for placements and scores tables

