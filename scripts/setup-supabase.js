const { Client } = require('pg');

const sql = `
create table if not exists public.maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null default 'Aventurier',
  name text not null,
  cells jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists maps_user_id_idx on public.maps(user_id);
create index if not exists maps_public_idx on public.maps(is_public) where is_public = true;

alter table public.maps enable row level security;

drop policy if exists maps_select_public_or_owner on public.maps;
drop policy if exists maps_insert_owner on public.maps;
drop policy if exists maps_update_owner on public.maps;
drop policy if exists maps_delete_owner on public.maps;

create policy maps_select_public_or_owner
on public.maps
for select
using (is_public = true or auth.uid() = user_id);

create policy maps_insert_owner
on public.maps
for insert
with check (auth.uid() = user_id);

create policy maps_update_owner
on public.maps
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy maps_delete_owner
on public.maps
for delete
using (auth.uid() = user_id);
`;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL manquant.');
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Supabase schema ok.');
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
