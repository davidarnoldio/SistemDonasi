-- =============================================================================
-- 20261103000002_public_read_rpc.sql
-- Mengganti view publik dengan fungsi SECURITY DEFINER.
--
-- Alasan: view Postgres berjalan dengan hak PEMILIK view (postgres) sehingga
-- RLS tabel di bawahnya TIDAK berlaku. Lint Supabase `security_definer_view`
-- benar-benar memperingatkan hal ini pada public.public_donors, admin_donations,
-- dan campaign_stats. Fungsi SECURITY DEFINER membuat sumber hak akses
-- eksplisit, dan kita bisa mengunci: baris (status), kolom, masking nama, serta
-- batas jumlah hasil (clamp) di satu tempat.
--
-- Aman dijalankan berulang. Jalankan juga file ini pada database yang sudah
-- pernah menjalankan schema/migrasi versi lama.
-- =============================================================================

-- 1. Buang view lama (kalau ada) supaya tidak ada jalur baca ber-privilese pemilik.
drop view if exists public.public_donors;
drop view if exists public.admin_donations;
drop view if exists public.campaign_stats;

-- 2. Daftar donatur publik: hanya donasi terverifikasi, nama disembunyikan bila
--    donatur memilihnya, kolom terbatas, dan hasil dibatasi maksimal 200 baris.
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

-- 3. Statistik kampanye: agregat donasi terverifikasi saja, tanpa data pribadi.
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

-- 4. Pastikan tabel donasi tetap tertutup rapat: RLS aktif, tanpa policy baca
--    untuk anon/authenticated (semua akses lewat fungsi/Edge Function).
alter table public.donations enable row level security;
