-- =========================================================
-- SURYA TEJA ORDER MANAGEMENT SYSTEM
-- SUPABASE SCHEMA ADDITIONS + RLS POLICIES
-- Current free/simple launch version
-- =========================================================

-- =========================================================
-- REQUIRED COLUMN ADDITIONS
-- =========================================================

alter table orders
add column if not exists party_name text,
add column if not exists quantity text,
add column if not exists variety text,
add column if not exists comment text,
add column if not exists loading_type text,
add column if not exists loading_date date;

alter table mediators
add column if not exists can_view_rates boolean default true;

-- =========================================================
-- ENABLE RLS
-- =========================================================

alter table mediators enable row level security;
alter table orders enable row level security;
alter table bill_copies enable row level security;
alter table product_rates enable row level security;
alter table notifications enable row level security;

-- =========================================================
-- CLEAN OLD POLICIES
-- =========================================================

drop policy if exists "Allow mediator registration insert" on mediators;
drop policy if exists "Allow registration notification insert" on notifications;
drop policy if exists "Allow mediator login check" on mediators;
drop policy if exists "Allow staff read mediators" on mediators;
drop policy if exists "Allow staff update mediators" on mediators;
drop policy if exists "Allow mediator insert orders" on orders;
drop policy if exists "Allow mediator read orders" on orders;
drop policy if exists "Allow mediator update own orders" on orders;
drop policy if exists "Allow staff read orders" on orders;
drop policy if exists "Allow staff update orders" on orders;
drop policy if exists "Allow staff read bills" on bill_copies;
drop policy if exists "Allow staff insert bills" on bill_copies;
drop policy if exists "Allow staff read product rates" on product_rates;
drop policy if exists "Allow staff update product rates" on product_rates;
drop policy if exists "Allow staff insert product rates" on product_rates;
drop policy if exists "Allow public read product rates" on product_rates;
drop policy if exists "Allow mediator order notifications" on notifications;
drop policy if exists "Public insert orders" on orders;
drop policy if exists "Public read orders" on orders;
drop policy if exists "Public update orders" on orders;
drop policy if exists "Public insert notifications" on notifications;
drop policy if exists "Public read mediators" on mediators;
drop policy if exists "Public insert mediators" on mediators;
drop policy if exists "Public update mediators" on mediators;
drop policy if exists "Public read bill copies" on bill_copies;
drop policy if exists "Public insert bill copies" on bill_copies;
drop policy if exists "Public update bill copies" on bill_copies;
drop policy if exists "Public read product rates" on product_rates;
drop policy if exists "Public insert product rates" on product_rates;
drop policy if exists "Public update product rates" on product_rates;
drop policy if exists "Public read notifications" on notifications;
drop policy if exists "Public update notifications" on notifications;

-- =========================================================
-- MEDIATORS TABLE
-- Current scenarios:
-- 1. Mediator registration insert
-- 2. Mediator login check
-- 3. Staff view mediator approvals
-- 4. Staff approve/reject mediator
-- 5. Staff reset mediator password
-- 6. Staff enable/disable mediator rate access
-- =========================================================

create policy "Public read mediators"
on mediators
for select
to public
using (true);

create policy "Public insert mediators"
on mediators
for insert
to public
with check (true);

create policy "Public update mediators"
on mediators
for update
to public
using (true)
with check (true);

-- =========================================================
-- ORDERS TABLE
-- Current scenarios:
-- 1. Mediator submits structured order
-- 2. Ready Loading orders
-- 3. Future Loading orders with loading_date
-- 4. Mediator views own order history from frontend filter
-- 5. Mediator edits/updates own order
-- 6. Staff views all orders
-- 7. Staff updates status/comment
-- =========================================================

create policy "Public read orders"
on orders
for select
to public
using (true);

create policy "Public insert orders"
on orders
for insert
to public
with check (true);

create policy "Public update orders"
on orders
for update
to public
using (true)
with check (true);

-- =========================================================
-- BILL COPIES TABLE
-- Current scenarios:
-- 1. Staff uploads bill metadata
-- 2. Staff views/searches all bills
-- 3. Mediator views bills by mobile/company
-- 4. Mediator downloads/prints/shares bills
-- =========================================================

create policy "Public read bill copies"
on bill_copies
for select
to public
using (true);

create policy "Public insert bill copies"
on bill_copies
for insert
to public
with check (true);

create policy "Public update bill copies"
on bill_copies
for update
to public
using (true)
with check (true);

-- =========================================================
-- PRODUCT RATES TABLE
-- Current scenarios:
-- 1. Home screen reads rates
-- 2. Mediator dashboard reads rates if can_view_rates is true
-- 3. Staff dashboard updates rates
-- 4. Staff dashboard upserts missing rates
-- =========================================================

create policy "Public read product rates"
on product_rates
for select
to public
using (true);

create policy "Public insert product rates"
on product_rates
for insert
to public
with check (true);

create policy "Public update product rates"
on product_rates
for update
to public
using (true)
with check (true);

-- =========================================================
-- NOTIFICATIONS TABLE
-- Current scenarios:
-- 1. Mediator registration notification
-- 2. Mediator structured order notification
-- 3. Mediator order update notification
-- 4. Bill upload notification
-- 5. Password reset notification
-- 6. Staff dashboard reads notifications
-- 7. Staff updates notification status
-- =========================================================

create policy "Public read notifications"
on notifications
for select
to public
using (true);

create policy "Public insert notifications"
on notifications
for insert
to public
with check (true);

create policy "Public update notifications"
on notifications
for update
to public
using (true)
with check (true);

-- =========================================================
-- STORAGE POLICIES FOR BILL COPIES
-- Bucket name: bill-copies
-- =========================================================

drop policy if exists "Public read bill files" on storage.objects;
drop policy if exists "Public upload bill files" on storage.objects;
drop policy if exists "Public update bill files" on storage.objects;
drop policy if exists "Public delete bill files" on storage.objects;

create policy "Public read bill files"
on storage.objects
for select
to public
using (bucket_id = 'bill-copies');

create policy "Public upload bill files"
on storage.objects
for insert
to public
with check (bucket_id = 'bill-copies');

create policy "Public update bill files"
on storage.objects
for update
to public
using (bucket_id = 'bill-copies')
with check (bucket_id = 'bill-copies');

-- =========================================================
-- IMPORTANT SECURITY NOTE
-- =========================================================
-- These policies are intentionally permissive for the current
-- static frontend + Supabase free/simple launch version.
--
-- For stronger production security:
-- 1. Move mediator login to Supabase Auth or backend hashing.
-- 2. Do not store plain text passwords.
-- 3. Use authenticated user IDs for row ownership.
-- 4. Restrict mediator SELECT/UPDATE to own rows only.
-- 5. Use signed URLs for private bill copies.
-- 6. Move sensitive staff operations to backend or Edge Functions.
-- =========================================================
