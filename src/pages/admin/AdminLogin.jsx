import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Checkbox from '../../components/ui/Checkbox.jsx'
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  FileSearchIcon,
  InfoIcon,
  ListChecksIcon,
  LockKeyholeIcon,
  MailIcon,
  ShieldCheckIcon,
  ShieldUserIcon,
} from '../../components/ui/icons.jsx'
import Logo from '../../components/ui/Logo.jsx'
import { DonationError, getAdminDonations } from '../../lib/donations.js'
import { isSupabaseConfigured } from '../../lib/supabase.js'
import { setAdminAuth } from '../../lib/simulationStore.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Email dan kata sandi wajib diisi.')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (isSupabaseConfigured) {
        // Uji kredensial ke Edge Function admin; 401 berarti salah email/password.
        // Kredensial disimpan di env Edge Function (ADMIN_EMAIL + ADMIN_PASSWORD_HASH).
        await getAdminDonations(`${email}:${password}`)
      } else {
        // Mode demo lokal tanpa Supabase: terima login apa pun (simulasi).
        await new Promise((resolve) => setTimeout(resolve, 600))
      }

      setAdminAuth(
        {
          id: 'admin-01',
          name: 'Admin KasihBersama',
          email,
          role: 'Super Admin',
          initials: 'AD',
          // Simpan kredensial untuk panggilan Edge Function selanjutnya.
          // Hanya di sessionStorage (tidak persisten) kecuali "Ingat saya".
          _auth: `${email}:${password}`,
        },
        rememberMe,
      )
      navigate('/admin/verifikasi')
    } catch (err) {
      if (err instanceof DonationError && err.code === 'HTTP_401') {
        setError('Email atau kata sandi salah.')
      } else if (err instanceof DonationError) {
        setError(err.message)
      } else {
        setError('Gagal masuk. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-cream-soft">
      <div className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl md:my-8 md:rounded-3xl lg:grid lg:grid-cols-12 lg:border lg:border-line/70">
        {/* =======================================================
         * LEFT PANEL (matching Identitas pengelola in SVG)
         * ===================================================== */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#C8D9BF] p-8 lg:col-span-5 lg:p-12">
          {/* Subtle Decorative Circles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full border border-mint/30"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-10 size-60 rounded-full border border-mint/20"
          />

          {/* Top Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <Logo />
            </Link>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-12 font-bold text-primary shadow-xs backdrop-blur-xs">
              <ShieldCheckIcon className="size-4" />
              <span>Portal Admin KasihBersama</span>
            </div>

            <h1 className="mt-6 text-24 font-black leading-tight text-ink md:text-32">
              Kelola & Verifikasi Donasi dengan Amanah
            </h1>

            <p className="mt-4 text-14 leading-relaxed text-ink/80">
              Sistem verifikasi manual untuk memastikan setiap rupiah kebaikan tersalurkan kepada
              mereka yang benar-benar membutuhkan.
            </p>

            {/* 3 Inspection Steps */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3.5 shadow-xs backdrop-blur-xs">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <FileSearchIcon className="size-4" />
                </div>
                <div>
                  <p className="text-13 font-bold text-ink">1. Periksa Bukti Transfer</p>
                  <p className="text-12 text-ink/70">
                    Cocokkan nominal dan nama pengirim dengan mutasi rekening.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3.5 shadow-xs backdrop-blur-xs">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <ListChecksIcon className="size-4" />
                </div>
                <div>
                  <p className="text-13 font-bold text-ink">2. Validasi Data Donatur</p>
                  <p className="text-12 text-ink/70">
                    Pastikan kelengkapan doa, opsi anonim, dan kampanye tujuan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3.5 shadow-xs backdrop-blur-xs">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <ShieldCheckIcon className="size-4" />
                </div>
                <div>
                  <p className="text-13 font-bold text-ink">3. Konfirmasi & Publikasi</p>
                  <p className="text-12 text-ink/70">
                    Update status donasi agar tercatat di daftar donatur publik.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 mt-10 border-t border-primary/20 pt-6 text-12 text-ink/60">
            © 2026 KasihBersama. Portal Khusus Pengelola.
          </div>
        </div>

        {/* =======================================================
         * RIGHT PANEL (matching Area masuk / Formulir login in SVG)
         * ===================================================== */}
        <div className="flex flex-1 flex-col justify-center p-8 lg:col-span-7 lg:p-14">
          <div className="mx-auto w-full max-w-md">
            {/* Access Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-11 font-bold text-amber-900 border border-amber-200">
                <LockKeyholeIcon className="size-3.5 text-amber-700" />
                Akses Terbatas
              </span>
              <Link to="/" className="text-12 font-semibold text-primary hover:underline">
                ← Kembali ke Situs Publik
              </Link>
            </div>

            {/* Header with Admin Shield Avatar */}
            <div className="mt-6 flex items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <ShieldUserIcon className="size-6" />
              </div>
              <div>
                <h2 className="text-22 font-extrabold text-ink">Masuk ke Akun Admin</h2>
                <p className="text-13 text-muted">
                  Kelola verifikasi donasi dan laporan transaksi masuk.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-13 text-red-700">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-13 font-bold text-ink">Email Admin</label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                    <MailIcon className="size-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kasihbersama.id"
                    className="h-control w-full rounded-xl border border-line bg-surface pl-10 pr-4 text-14 text-ink transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-13 font-bold text-ink">Kata Sandi</label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                    <LockKeyholeIcon className="size-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-control w-full rounded-xl border border-line bg-surface pl-10 pr-11 text-14 text-ink transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted hover:text-ink"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                  Ingat saya di perangkat ini
                </Checkbox>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full gap-2 font-bold shadow-md"
                >
                  Masuk ke Dashboard
                  <ArrowRightIcon className="size-4" />
                </Button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-line/70 bg-[#FDFCF4] p-3.5 text-12 text-muted">
              <InfoIcon className="size-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-relaxed">
                Portal ini hanya dapat diakses oleh tim administrator KasihBersama. Semua tindakan
                verifikasi dan perubahan status donasi tercatat dalam riwayat audit sistem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

