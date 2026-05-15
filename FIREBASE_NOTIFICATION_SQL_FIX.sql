-- Run this in Supabase Dashboard → SQL Editor
-- Fixes browser Firebase push token saving for Suryateja Order Management.

create table if not exists user_notification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_role text not null,
  mobile text,
  company_name text,
  fcm_token text not null unique,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_notification_tokens add column if not exists company_name text;
alter table user_notification_tokens add column if not exists updated_at timestamptz default now();
alter table user_notification_tokens add column if not exists is_active boolean default true;

create unique index if not exists user_notification_tokens_fcm_token_unique
on user_notification_tokens (fcm_token);

alter table user_notification_tokens enable row level security;

drop policy if exists "public_read_tokens" on user_notification_tokens;
drop policy if exists "public_insert_tokens" on user_notification_tokens;
drop policy if exists "public_update_tokens" on user_notification_tokens;

create policy "public_read_tokens"
on user_notification_tokens
for select
to public
using (true);

create policy "public_insert_tokens"
on user_notification_tokens
for insert
to public
with check (true);

create policy "public_update_tokens"
on user_notification_tokens
for update
to public
using (true)
with check (true);
