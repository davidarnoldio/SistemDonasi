# KasihBersama

Simulasi platform donasi dengan alur modal 4 langkah. **Project kuliah dalam Mode Simulasi**: tidak ada penggalangan dana sungguhan dan tidak ada payment gateway. Donatur "transfer" ke rekening/QR contoh, mengunggah foto bukti, lalu admin memverifikasi melalui dashboard admin di `/admin/login`.

Stack: Vite, React 18, Tailwind CSS 4, Supabase (Postgres + Storage + **Edge Functions**), deploy di Vercel.

## Arsitektur

**Prinsip utama**: frontend hanya memegang **anon key**. Semua operasi tulis (insert donasi, upload bukti, verifikasi admin) dilakukan lewat **Edge Functions** yang berjalan dengan `service_role` di server Supabase. No. transaksi & kode unik **di-generate server-side** sehingga tidak bisa dipalsukan klien. RLS tetap aktif: anon hanya bisa membaca view publik `public_donors`.

```
Browser (anon key)
  │  POST /functions/v1/create-donation   → buat donasi 'pending' (tx_no + kode unik server)
  │  POST /functions/v1/submit-donation   → upload bukti (multipart, validasi magic bytes)
  │  rpc  list_public_donors(...)         → daftar donatur terverifikasi (SECURITY DEFINER)
  │  POST /functions/v1/verify-donation   → admin: ubah status (x-admin-auth)
  │  POST /functions/v1/list-donations    → admin: daftar semua donasi + signed URL bukti
  ▼
Edge Functions (service_role, bypass RLS) → Postgres + Storage
```

## Alur donasi

1. **Masukkan Nominal**: chip cepat atau ketik sendiri (Rp 10.000 sampai Rp 50.000.000).
2. **Opsi Tambahan**: nama lengkap, sembunyikan nama (tampil publik sebagai "Hamba Allah"), doa & dukungan (maks. 200 karakter).
3. **Pilih Pembayaran**: QRIS, BCA, atau SeaBank. Total = nominal + kode unik 3 digit. Kode unik & no. transaksi dibuat **server** saat tombol "Sudah Transfer" diklik.
4. **Instruksi & Upload Bukti**: QR atau nomor rekening, lalu unggah foto bukti (JPG/PNG, maks. 2 MB). Setelah terkirim, ringkasan menampilkan status **Menunggu Verifikasi**.

## Menjalankan di komputer

Butuh Node.js 20.19+ atau 22.12+.

```bash
npm install
npm run dev
```

Buka http://localhost:5173. Selama Supabase belum diatur, alur tetap bisa dicoba sebagai **demo lokal**: bukti tidak dikirim ke mana pun dan halaman akan menampilkan pemberitahuan. Admin login di demo menerima kredensial apa pun.

## Menghubungkan Supabase

### 1. Database (migrasi)

Buka **SQL Editor**, tempel isi `supabase/migrations/20261103000001_init.sql`, lalu **Run**. File ini:
- membuat tabel `donations` (+ kolom `rejection_reason`, `verified_at`),
- RLS tanpa policy insert/update untuk anon (semua tulis lewat Edge Function),
- fungsi `list_public_donors` — SECURITY DEFINER, pengganti view (daftar donatur terverifikasi, tanpa data sensitif),
- bucket privat `proofs` (limit 2 MB, hanya JPG/PNG),
- fungsi `create_donation_server(jsonb)` — SECURITY DEFINER, dipakai Edge Function.

> File ini **idempotent**: aman dijalankan berulang. Kalau memakai Supabase CLI, cukup `supabase db push`.

Jika database sudah pernah memakai versi lama (yang membuat view `public_donors`), jalankan juga `supabase/migrations/20261103000002_public_read_rpc.sql`. Migrasi ini membuang view tersebut dan menggantinya dengan fungsi SECURITY DEFINER, sekaligus menghilangkan peringatan lint `security_definer_view`.

### 2. Deploy Edge Functions

```bash
npm i -g supabase        # sekali saja
supabase login
supabase link --project-ref <project-ref>
supabase functions deploy create-donation --no-verify-jwt
supabase functions deploy submit-donation --no-verify-jwt
supabase functions deploy verify-donation --no-verify-jwt
supabase functions deploy list-donations --no-verify-jwt
```

### 3. Set kredensial admin (secret Edge Function)

```bash
# hash password admin (contoh password: ganti-ini)
node -e "console.log(require('crypto').createHash('sha256').update('ganti-ini').digest('hex'))"

supabase secrets set ADMIN_EMAIL=admin@kasihbersama.id
supabase secrets set ADMIN_PASSWORD_HASH=<hash-dari-atas>
```

### 4. Environment frontend

Salin `.env.example` menjadi `.env.local`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Jalankan ulang `npm run dev`.

> Hanya pakai **anon key**. Jangan pernah menaruh `service_role` key di frontend atau di repo.

## Admin

- Login: `/admin/login` (kredensial = `ADMIN_EMAIL` + password dari secret di atas).
- Dashboard: `/admin/verifikasi` — daftar semua kiriman (termasuk pending), pratinjau bukti via signed URL, tandai valid/tolak (dengan alasan).
- Route terproteksi: tanpa sesi, redirect ke login. Tidak ada lagi auto-login demo ketika Supabase aktif.

## Deploy ke Vercel

1. Push project ke GitHub.
2. Di Vercel: **Add New > Project**, lalu import repo tersebut (preset Vite terdeteksi otomatis).
3. Buka **Environment Variables**, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
4. Klik **Deploy**.

`vercel.json` mengarahkan semua path ke `index.html` supaya membuka `/donatur` langsung tidak 404. Jika environment variable diubah setelah deploy, lakukan **Redeploy** karena nilainya ditanam saat build.

## Mengganti data dummy

- `src/config/payment.js`: nama pemilik, nomor rekening, dan isi QR. Semua masih placeholder, ganti sendiri.
- `src/config/campaign.js`: judul kampanye, batas nominal, dan chip nominal cepat. Batasnya harus sama dengan constraint di `supabase/migrations/20261103000001_init.sql`.

## Struktur folder

```
src/
  components/ui/        Button, Chip, Input, Textarea, Checkbox, Radio, ProgressSteps, ModalShell, StatusBadge, ...
  components/donation/  DonationModal, StepNominal, StepOpsi, StepPembayaran, StepInstruksi, StepRingkasan, CampaignSummary
  components/admin/     LogoutModal
  components/campaign/  CreateCampaignModal, CampaignDetailModal
  config/               payment.js (rekening dummy), campaign.js (kampanye dummy), env.js (validasi env)
  hooks/                useDonationFlow.js (state dan aturan alur)
  lib/                  supabase.js (client + URL Edge), donations.js (panggilan Edge Function), format.js, validation.js
  pages/                Beranda, DaftarDonatur, admin/AdminLogin, admin/AdminVerification
supabase/
  migrations/           SQL berversi (idempotent)
  functions/            Edge Functions (Deno): create-donation, submit-donation, verify-donation, list-donationsdesign/                 ekspor SVG dari Figma (referensi; boleh dihapus)
```

Design token (warna, font Plus Jakarta Sans, radius, shadow, ukuran) ada di `src/index.css`, diambil dari Figma.

## Pemecahan masalah

| Pesan / gejala | Penyebab dan solusi |
| --- | --- |
| "Supabase belum terhubung" | `.env.local` belum diisi, atau dev server belum dijalankan ulang. |
| Insert gagal "Function not found" / 404 | Edge Function belum dideploy. Jalankan langkah deploy di atas. |
| Admin login selalu "Email atau kata sandi salah" | `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` belum di-set via `supabase secrets set`. |
| Daftar donatur kosong | Belum ada donasi berstatus `verified`. Tandai lewat dashboard admin. |
| Lint "security_definer_view" pada public_donors | Sudah diperbaiki: view diganti fungsi `list_public_donors` (lihat `20261103000002_public_read_rpc.sql`). |
| Bukti transfer tidak tampil di dashboard admin | Bucket `proofs` belum dibuat (jalankan migrasi), atau file melebihi 2 MB / bukan JPG/PNG (ditolak server). |
| `schema.sql` lama error "already exists" | File lama sudah deprecated; pakai `supabase/migrations/20261103000001_init.sql` yang idempotent. |
