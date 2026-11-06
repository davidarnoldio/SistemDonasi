-- =============================================================================
-- 20261103000001_init.sql
-- Skema awal KasihBersama. Idempotent: aman dijalankan berulang.
-- Jalankan via SQL Editor, atau `supabase db push` jika pakai CLI.
--
-- Perubahan dari schema.sql lama:
--  - Insert donasi + upload bukti dipindah ke Edge Function (service_role),
--    jadi policy "anon insert" dan grant insert ke anon TIDAK diperlukan lagi.
--  - Ditambah kolom rejection_reason dan verified_at.
--  - no_transaksi + kode unik di-generate server-side (function).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tabel utama
-- ---------------------------------------------------------------------------
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  transaction_no text not null unique,
  campaign_slug text not null,
  donor_name text not null check (char_length(donor_name) between 1 and 80),
  hide_name boolean not null default false,
  amount integer not null check (amount between 10000 and 50000000),
  unique_code integer not null check (unique_code between 100 and 999),
  method text not null check (method in ('qris','bca','seabank')),
  message text check (char_length(message) <= 200),
  proof_path text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 300),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Kolom baru untuk project yang sudah memakai schema lama
alter table public.donations
  add column if not exists rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 300),
  add column if not exists verified_at timestamptz;

create index if not exists donations_status_created_idx
  on public.donations (status, created_at desc);
create index if not exists donations_campaign_idx
  on public.donations (campaign_slug);

-- ---------------------------------------------------------------------------
-- RLS: frontend hanya boleh MEMBACA view publik. Semua tulis lewat Edge
-- Function (service_role, bypass RLS), jadi tidak ada policy insert/update
-- untuk anon sama sekali.
-- ---------------------------------------------------------------------------
alter table public.donations enable row level security;

drop policy if exists "anon insert pending" on public.donations;
revoke insert on public.donations from anon; -- tidak lagi dipakai

-- ---------------------------------------------------------------------------
-- Pembacaan publik: FUNGSI SECURITY DEFINER, bukan view.
--
-- Catatan penting: view Postgres berjalan dengan hak PEMILIK view (postgres,
-- yang bypass RLS), sehingga `where status='verified'` di dalam view adalah
-- satu-satunya pengaman — itulah yang diperingatkan lint `security_definer_view`.
-- Karena `donations` sengaja tidak punya policy RLS untuk anon sama sekali,
-- pemakaian fungsi SECURITY DEFINER membuat pemfilteran (status, masking nama,
-- pemilihan kolom, clamp limit) menjadi eksplisit dan bisa diaudit.
-- ---------------------------------------------------------------------------
create or replace function public.list_public_donors(limit_count integer default 100)
returns table (
  id uuid,
  display_name text,
  amount integer,
  message text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select d.id,
         case when d.hide_name then 'Hamba Allah' else d.donor_name end as display_name,
         d.amount,
         d.message,
         d.created_at
  from public.donations d
  where d.status = 'verified'
  order by d.created_at desc
  limit least(greatest(coalesce(limit_count, 100), 1), 200);
$$;

revoke all on function public.list_public_donors(integer) from public;
grant execute on function public.list_public_donors(integer) to anon, authenticated;

-- Statistik kampanye: hanya agregat donasi terverifikasi (tanpa data pribadi).
create or replace function public.campaign_stats()
returns table (
  campaign_slug text,
  donor_count integer,
  raised bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select d.campaign_slug,
         count(*)::int as donor_count,
         coalesce(sum(d.amount), 0)::bigint as raised
  from public.donations d
  where d.status = 'verified'
  group by d.campaign_slug;
$$;

revoke all on function public.campaign_stats() from public;
grant execute on function public.campaign_stats() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Bucket privat untuk bukti transfer
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('proofs', 'proofs', false, 2097152, array['image/jpeg','image/png'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Policy storage lama untuk anon dihapus: upload sekarang dilakukan Edge
-- Function (service_role). Object-level RLS tetap aktif default Supabase.
drop policy if exists "anon upload proofs" on storage.objects;

-- ---------------------------------------------------------------------------
-- Fungsi generate no. transaksi & kode unik server-side (dipakai Edge Function
-- lewat RPC; SECURITY DEFINER supaya tidak butuh grant insert ke anon).
-- ---------------------------------------------------------------------------
create or replace function public.create_donation_server(payload jsonb)
returns public.donations
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.donations;
begin
  insert into public.donations (
    transaction_no, campaign_slug, donor_name, hide_name, amount,
    unique_code, method, message, proof_path, status
  ) values (
    'KB-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random() * 1000000))::text, 6, '0'),
    payload->>'campaign_slug',
    left(payload->>'donor_name', 80),
    coalesce((payload->>'hide_name')::boolean, false),
    (payload->>'amount')::integer,
    100 + floor(random() * 900)::integer,
    payload->>'method',
    nullif(payload->>'message', ''),
    nullif(payload->>'proof_path', ''),
    'pending'
  )
  returning * into row;
  return row;
end;
$$;

-- Jangan biarkan anon memanggil fungsi ini langsung; hanya service_role
-- (Edge Function) yang memakainya.
revoke execute on function public.create_donation_server(jsonb) from anon, authenticated;

