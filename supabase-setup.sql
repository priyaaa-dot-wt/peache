-- PEACHE database setup. Paste all of this into Supabase > SQL Editor > New query > Run.
create table if not exists public.orders(
  id uuid primary key default gen_random_uuid(),
  ref text not null unique check (ref ~ '^PCH-[A-Z0-9]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (length(name) between 1 and 100),
  phone text not null check (length(phone) between 7 and 20),
  email text check (email is null or length(email) <= 120),
  address text check (address is null or length(address) <= 500),
  event_date text check (event_date is null or length(event_date) <= 60),
  note text check (note is null or length(note) <= 1000),
  items jsonb not null,
  total integer not null default 0 check (total between 0 and 2000000),
  status text not null default 'under_review' check (status in ('under_review','confirmed','paid','ready','dispatched','delivered','cancelled')),
  payment_link text, courier text, awb text, delivery_date text
);
create table if not exists public.admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.orders enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean language sql security definer set search_path=public stable
as $$ select exists(select 1 from public.admins where user_id = auth.uid()) $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

grant insert on public.orders to anon;
grant select, update on public.orders to authenticated;

-- Visitors can only ADD an order. They can never read, change or delete orders.
drop policy if exists "visitors place orders" on public.orders;
create policy "visitors place orders" on public.orders for insert to anon
  with check (status='under_review' and payment_link is null and courier is null and awb is null and delivery_date is null);
-- Only admins can read and update orders.
drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders for select to authenticated using (public.is_admin());
drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Customers can look up ONE order if they know the order number AND the phone number.
create or replace function public.track_order(p_ref text, p_phone text)
returns table(ref text, created_at timestamptz, status text, items jsonb, total integer, delivery_date text, courier text, awb text)
language sql security definer set search_path=public stable as $$
  select o.ref,o.created_at,o.status,o.items,o.total,o.delivery_date,o.courier,o.awb from public.orders o
  where o.ref=upper(trim(p_ref)) and right(regexp_replace(o.phone,'\D','','g'),10)=right(regexp_replace(p_phone,'\D','','g'),10) limit 1 $$;
grant execute on function public.track_order(text,text) to anon, authenticated;

-- LAST STEP (after you create your admin user in Authentication > Users):
-- replace the email below with yours and run this line.
-- insert into public.admins(user_id) select id from auth.users where email = 'YOUR-EMAIL-HERE';
