import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CampaignDetailModal from '../../components/campaign/CampaignDetailModal.jsx'
import CreateCampaignModal from '../../components/campaign/CreateCampaignModal.jsx'
import LogoutModal from '../../components/admin/LogoutModal.jsx'
import Button from '../../components/ui/Button.jsx'
import {
  AlertCircleIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  FileCheck2Icon,
  FileImageIcon,
  HeartIcon,
  InfoIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from '../../components/ui/icons.jsx'
import Logo from '../../components/ui/Logo.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { CATEGORIES } from '../../config/campaign.js'
import { getPaymentMethod } from '../../config/payment.js'
import { formatDate, formatRupiah } from '../../lib/format.js'
import {
  deleteCampaign,
  getAllCampaigns,
  resetCampaignsToDefault,
} from '../../lib/campaignStore.js'
import {
  clearAdminAuth,
  getAdminAuth,
  getStoredDonations,
  updateDonationStatus,
} from '../../lib/simulationStore.js'
import { DonationError, getAdminDonations, verifyDonation } from '../../lib/donations.js'
import { isSupabaseConfigured } from '../../lib/supabase.js'

export default function AdminVerification() {
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState(() => getAdminAuth())
  const [adminTab, setAdminTab] = useState('verifikasi') // 'verifikasi' | 'kampanye'

  // Verification states
  const [donations, setDonations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'verified' | 'rejected'
  const [sortBy, setSortBy] = useState('newest')
  const [rejectionReason, setRejectionReason] = useState('')

  // Modals & UI states
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null)
  const [previewCampaign, setPreviewCampaign] = useState(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [actionSuccessMessage, setActionSuccessMessage] = useState('')
  const [actionErrorMessage, setActionErrorMessage] = useState('')
  const [isLoadingDonations, setIsLoadingDonations] = useState(false)

  // Campaigns states
  const [campaignList, setCampaignList] = useState(() => getAllCampaigns())
  const [campaignSearch, setCampaignSearch] = useState('')
  const [campaignCategory, setCampaignCategory] = useState('Semua')

  // Route guard: tanpa sesi admin, lempar ke login. (Auto-login demo dihapus.)
  useEffect(() => {
    if (!getAdminAuth()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  // Load donations: dari Supabase (Edge Function) jika terhubung, atau localStorage (demo)
  const refreshDonations = useCallback(async () => {
    const auth = adminUser?._auth
    if (isSupabaseConfigured && auth) {
      setIsLoadingDonations(true)
      try {
        const remote = await getAdminDonations(auth)
        // Gabungkan: data remote + data demo lokal yang belum tersinkron
        const local = getStoredDonations()
        const remoteIds = new Set(remote.map((d) => d.transaction_no))
        const localOnly = local.filter((d) => !remoteIds.has(d.transaction_no))
        const merged = [...remote, ...localOnly]
        setDonations(merged)
        if (!selectedId && merged.length > 0) {
          setSelectedId(merged[0].id)
        }
      } catch (err) {
        setActionErrorMessage(
          err instanceof DonationError ? err.message : 'Data donasi Supabase gagal dimuat.',
        )
        setDonations(getStoredDonations())
      } finally {
        setIsLoadingDonations(false)
      }
      return
    }
    const list = getStoredDonations()
    setDonations(list)
    if (!selectedId && list.length > 0) {
      setSelectedId(list[0].id)
    }
  }, [adminUser, selectedId])

  // Load campaigns from store
  const refreshCampaigns = useCallback(() => {
    setCampaignList(getAllCampaigns())
  }, [])

  useEffect(() => {
    refreshDonations()
    refreshCampaigns()
    window.addEventListener('kasihbersama_donations_updated', refreshDonations)
    window.addEventListener('kasihbersama_campaigns_updated', refreshCampaigns)
    return () => {
      window.removeEventListener('kasihbersama_donations_updated', refreshDonations)
      window.removeEventListener('kasihbersama_campaigns_updated', refreshCampaigns)
    }
  }, [refreshDonations, refreshCampaigns])

  // Filtered & Sorted donations list
  const filteredDonations = useMemo(() => {
    let result = [...donations]

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          d.donor_name.toLowerCase().includes(q) ||
          d.transaction_no.toLowerCase().includes(q) ||
          (d.campaign_title && d.campaign_title.toLowerCase().includes(q)),
      )
    }

    result.sort((a, b) => {
      const tA = new Date(a.created_at).getTime()
      const tB = new Date(b.created_at).getTime()
      return sortBy === 'newest' ? tB - tA : tA - tB
    })

    return result
  }, [donations, statusFilter, searchQuery, sortBy])

  // Filtered campaigns list
  const filteredCampaigns = useMemo(() => {
    let result = [...campaignList]

    if (campaignCategory !== 'Semua') {
      result = result.filter((c) => c.category === campaignCategory)
    }

    if (campaignSearch.trim()) {
      const q = campaignSearch.toLowerCase().trim()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.organizer.toLowerCase().includes(q) ||
          (c.beneficiary && c.beneficiary.toLowerCase().includes(q)),
      )
    }

    return result
  }, [campaignList, campaignCategory, campaignSearch])

  // Total targets & raised across campaigns
  const campaignTotals = useMemo(() => {
    const totalTarget = campaignList.reduce((acc, c) => acc + (Number(c.target) || 0), 0)
    const totalRaised = campaignList.reduce((acc, c) => acc + (Number(c.raised) || 0), 0)
    return { totalTarget, totalRaised }
  }, [campaignList])

  // Currently selected item for verification
  const activeDonation =
    donations.find((d) => d.id === selectedId || d.transaction_no === selectedId) ||
    filteredDonations[0] ||
    null

  // Metrics counts
  const counts = useMemo(() => {
    const pending = donations.filter((d) => d.status === 'pending').length
    const verified = donations.filter((d) => d.status === 'verified').length
    const rejected = donations.filter((d) => d.status === 'rejected').length
    return { pending, verified, rejected, total: donations.length }
  }, [donations])

  // Handle Mark Valid (via Edge Function verify-donation)
  async function handleMarkValid() {
    if (!activeDonation) return
    setActionErrorMessage('')
    updateDonationStatus(activeDonation.id, { status: 'verified' })

    if (isSupabaseConfigured && adminUser?._auth) {
      try {
        await verifyDonation({
          transactionNo: activeDonation.transaction_no,
          status: 'verified',
          adminAuth: adminUser._auth,
        })
      } catch (err) {
        setActionErrorMessage(
          err instanceof DonationError
            ? `Gagal memverifikasi di server: ${err.message}`
            : 'Gagal memverifikasi di server. Coba lagi.',
        )
        refreshDonations()
        return
      }
    }

    setActionSuccessMessage(`Donasi #${activeDonation.transaction_no} berhasil diverifikasi!`)
    setTimeout(() => setActionSuccessMessage(''), 3000)
    refreshDonations()
    refreshCampaigns()
  }

  // Handle Mark Rejected (via Edge Function verify-donation)
  async function handleMarkRejected() {
    if (!activeDonation) return
    setActionErrorMessage('')
    const reason = rejectionReason.trim() || 'Bukti transfer tidak valid atau dana belum masuk.'
    updateDonationStatus(activeDonation.id, { status: 'rejected', rejection_reason: reason })

    if (isSupabaseConfigured && adminUser?._auth) {
      try {
        await verifyDonation({
          transactionNo: activeDonation.transaction_no,
          status: 'rejected',
          rejectionReason: reason,
          adminAuth: adminUser._auth,
        })
      } catch (err) {
        setActionErrorMessage(
          err instanceof DonationError
            ? `Gagal menolak di server: ${err.message}`
            : 'Gagal menolak di server. Coba lagi.',
        )
        refreshDonations()
        return
      }
    }

    setRejectionReason('')
    setActionSuccessMessage(`Donasi #${activeDonation.transaction_no} ditandai tidak valid.`)
    setTimeout(() => setActionSuccessMessage(''), 3000)
    refreshDonations()
  }

  // Handle Delete Campaign
  function handleConfirmDeleteCampaign() {
    if (!deleteConfirmItem) return
    deleteCampaign(deleteConfirmItem.id)
    setActionSuccessMessage(`Kampanye "${deleteConfirmItem.title}" berhasil dihapus.`)
    setTimeout(() => setActionSuccessMessage(''), 4000)
    setDeleteConfirmItem(null)
    refreshCampaigns()
  }

  // Handle Reset Campaigns
  function handleResetCampaigns() {
    resetCampaignsToDefault()
    setActionSuccessMessage('Daftar kampanye berhasil dikembalikan ke 6 kampanye bawaan.')
    setTimeout(() => setActionSuccessMessage(''), 4000)
    setResetConfirmOpen(false)
    refreshCampaigns()
  }

  function handleLogout() {
    clearAdminAuth()
    setLogoutModalOpen(false)
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* =========================================================
       * 1. ADMIN SIDEBAR
       * ======================================================= */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-line bg-white p-5 lg:flex">
        <div>
          {/* Logo & Portal Branding */}
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2.5 py-1 text-11 font-bold text-primary">
            <ShieldCheckIcon className="size-3.5" />
            <span>Portal Pengelola</span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5" aria-label="Menu navigasi admin">
            {/* Tab 1: Verifikasi Donasi */}
            <button
              type="button"
              onClick={() => setAdminTab('verifikasi')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-14 font-bold transition-all text-left ${
                adminTab === 'verifikasi'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:bg-surface hover:text-ink'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2Icon className="size-4" />
                <span>Verifikasi Donasi</span>
              </div>
              {counts.pending > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-11 font-black ${
                    adminTab === 'verifikasi'
                      ? 'bg-white text-primary'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {counts.pending}
                </span>
              )}
            </button>

            {/* Tab 2: Kelola Kampanye */}
            <button
              type="button"
              onClick={() => setAdminTab('kampanye')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-14 font-bold transition-all text-left ${
                adminTab === 'kampanye'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:bg-surface hover:text-ink'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayersIcon className="size-4" />
                <span>Kelola Kampanye</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-11 font-bold ${
                  adminTab === 'kampanye'
                    ? 'bg-white/90 text-primary'
                    : 'bg-surface text-muted'
                }`}
              >
                {campaignList.length}
              </span>
            </button>

            {/* View Landing */}
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-14 font-semibold text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <LayoutDashboardIcon className="size-4" />
              <span>Lihat Beranda</span>
            </Link>

            {/* Donors List */}
            <Link
              to="/donatur"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-14 font-semibold text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <UsersIcon className="size-4" />
              <span>Daftar Donatur</span>
            </Link>

            {/* Quick Add Campaign Button */}
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary-soft/40 px-3.5 py-2.5 text-14 font-bold text-primary transition-colors hover:bg-primary-soft text-left"
            >
              <PlusIcon className="size-4" />
              <span>+ Galang Dana Baru</span>
            </button>
          </nav>

          {/* Admin Guide Box */}
          <div className="mt-8 rounded-2xl border border-line bg-[#FDFCF4] p-4 text-12 text-ink">
            <div className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheckIcon className="size-4" />
              <span>Panduan Pengelola</span>
            </div>
            <p className="mt-1.5 leading-relaxed text-muted text-11">
              {adminTab === 'verifikasi'
                ? 'Periksa kecocokan nominal transfer (termasuk 3 digit kode unik) dan bukti struk sebelum menandai valid.'
                : 'Anda dapat menambahkan kampanye baru atau menghapus kampanye yang sudah selesai agar beranda selalu relevan.'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-14 font-semibold text-danger transition-colors hover:bg-red-50"
          >
            <LogOutIcon className="size-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* =========================================================
       * 2. MAIN WORKSPACE
       * ======================================================= */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-13">
              <span className="text-muted">Admin</span>
              <span className="text-line">/</span>
              <span className="font-bold text-ink">
                {adminTab === 'verifikasi' ? 'Verifikasi Donasi' : 'Kelola Kampanye'}
              </span>
            </div>

            {/* Mobile/Tablet Tab Switcher Pills */}
            <div className="ml-4 flex items-center gap-1 rounded-xl bg-surface p-1 text-12 font-bold lg:hidden">
              <button
                type="button"
                onClick={() => setAdminTab('verifikasi')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  adminTab === 'verifikasi'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-muted'
                }`}
              >
                Verifikasi ({counts.pending})
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('kampanye')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  adminTab === 'kampanye'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-muted'
                }`}
              >
                Kampanye ({campaignList.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 font-bold shadow-xs"
            >
              <PlusIcon className="size-4" />
              <span>+ Galang Dana</span>
            </Button>

            <Link
              to="/"
              className="hidden text-13 font-semibold text-primary hover:underline sm:inline-block"
            >
              ← Ke Halaman Publik
            </Link>

            {/* Admin Avatar Pill */}
            <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1.5 pr-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-12 font-bold text-white">
                {adminUser?.initials || 'AD'}
              </span>
              <div className="text-left">
                <p className="text-12 font-bold text-ink leading-none">{adminUser?.name || 'Admin'}</p>
                <p className="text-10 text-muted leading-tight mt-0.5">{adminUser?.role || 'Super Admin'}</p>
              </div>
            </div>

            {/* Mobile Logout */}
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="text-danger hover:opacity-80 lg:hidden"
              aria-label="Logout"
            >
              <LogOutIcon className="size-5" />
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Success Banner Notice */}
          {actionSuccessMessage && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-primary-soft border border-primary/30 p-3.5 text-13 font-semibold text-primary shadow-xs">
              <div className="flex items-center gap-2">
                <CircleCheckIcon className="size-4 shrink-0 text-primary" />
                <span>{actionSuccessMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionSuccessMessage('')}
                className="text-primary hover:opacity-75"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          )}

          {/* Error Banner Notice */}
          {actionErrorMessage && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-danger-soft border border-danger/30 p-3.5 text-13 font-semibold text-danger shadow-xs" role="alert">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="size-4 shrink-0 text-danger" />
                <span>{actionErrorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionErrorMessage('')}
                className="text-danger hover:opacity-75"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          )}

          {/* Loading indicator */}
          {isLoadingDonations && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-line bg-white p-3.5 text-13 text-muted">
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memuat data donasi dari server…
            </div>
          )}

          {/* =======================================================
           * TAB A: VERIFIKASI BUKTI PEMBAYARAN
           * ===================================================== */}
          {adminTab === 'verifikasi' && (
            <div>
              {/* Page Title & Subtitle */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-24 font-extrabold text-ink md:text-28">
                    Verifikasi Bukti Pembayaran
                  </h1>
                  <p className="mt-1 text-14 text-muted">
                    Periksa dan konfirmasi berkas bukti transfer yang dikirimkan oleh donatur.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdminTab('kampanye')}
                    className="font-semibold text-13"
                  >
                    <LayersIcon className="size-4" />
                    Buka Kelola Kampanye →
                  </Button>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {/* Pending Card */}
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    statusFilter === 'pending'
                      ? 'border-amber-400 bg-amber-50/70 shadow-sm'
                      : 'border-line bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <ClockIcon className="size-6" />
                  </div>
                  <div>
                    <p className="text-12 font-bold uppercase tracking-wider text-muted">
                      Menunggu Verifikasi
                    </p>
                    <p className="text-24 font-black text-amber-900">{counts.pending}</p>
                    <p className="text-11 text-muted">Perlu tindakan</p>
                  </div>
                </button>

                {/* Verified Card */}
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'verified' ? 'all' : 'verified')}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    statusFilter === 'verified'
                      ? 'border-primary bg-primary-soft shadow-sm'
                      : 'border-line bg-white hover:border-primary/50'
                  }`}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <CircleCheckIcon className="size-6" />
                  </div>
                  <div>
                    <p className="text-12 font-bold uppercase tracking-wider text-muted">
                      Terverifikasi Valid
                    </p>
                    <p className="text-24 font-black text-primary">{counts.verified}</p>
                    <p className="text-11 text-muted">Tampil di donatur</p>
                  </div>
                </button>

                {/* Rejected Card */}
                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    statusFilter === 'rejected'
                      ? 'border-red-400 bg-red-50/70 shadow-sm'
                      : 'border-line bg-white hover:border-red-300'
                  }`}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-danger">
                    <CircleXIcon className="size-6" />
                  </div>
                  <div>
                    <p className="text-12 font-bold uppercase tracking-wider text-muted">
                      Ditolak / Tidak Valid
                    </p>
                    <p className="text-24 font-black text-danger">{counts.rejected}</p>
                    <p className="text-11 text-muted">Tidak memenuhi syarat</p>
                  </div>
                </button>
              </div>

              {/* VERIFICATION WORKSPACE (2 Columns Grid) */}
              <div className="mt-8 grid gap-6 lg:grid-cols-12">
                {/* LEFT COLUMN: Submissions List (5 Cols) */}
                <div className="flex flex-col rounded-2xl border border-line bg-white lg:col-span-5">
                  {/* Header with Search & Filters */}
                  <div className="border-b border-line p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-14 font-extrabold text-ink">Daftar Kiriman</h3>
                      <span className="rounded-full bg-surface px-2.5 py-0.5 text-11 font-bold text-muted">
                        {filteredDonations.length} Transaksi
                      </span>
                    </div>

                    {/* Search Box */}
                    <div className="relative mt-3">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                        <SearchIcon className="size-4" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari donatur atau ID transaksi..."
                        className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-13 text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Status Filter Chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-12">
                      <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                          statusFilter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-surface text-muted hover:text-ink'
                        }`}
                      >
                        Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('pending')}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                          statusFilter === 'pending'
                            ? 'bg-amber-500 text-white'
                            : 'bg-surface text-muted hover:text-ink'
                        }`}
                      >
                        Menunggu
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('verified')}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                          statusFilter === 'verified'
                            ? 'bg-primary text-white'
                            : 'bg-surface text-muted hover:text-ink'
                        }`}
                      >
                        Valid
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('rejected')}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                          statusFilter === 'rejected'
                            ? 'bg-danger text-white'
                            : 'bg-surface text-muted hover:text-ink'
                        }`}
                      >
                        Ditolak
                      </button>
                    </div>
                  </div>

                  {/* Submissions List Items */}
                  <div className="max-h-[640px] divide-y divide-line/60 overflow-y-auto">
                    {filteredDonations.length === 0 ? (
                      <div className="p-8 text-center text-13 text-muted">
                        Tidak ada kiriman donasi yang cocok.
                      </div>
                    ) : (
                      filteredDonations.map((item) => {
                        const isSelected = activeDonation?.id === item.id
                        const initial = item.donor_name.trim().charAt(0).toUpperCase() || 'D'
                        const totalTransfer = item.amount + (item.unique_code || 0)

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${
                              isSelected
                                ? 'bg-primary-soft/60 border-l-4 border-l-primary'
                                : 'hover:bg-surface/60'
                            }`}
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white border border-line text-14 font-extrabold text-primary shadow-xs">
                              {initial}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-13 font-bold text-ink">
                                  {item.donor_name}
                                </p>
                                <StatusBadge status={item.status} />
                              </div>

                              <p className="mt-0.5 text-11 font-mono text-muted">
                                {item.transaction_no}
                              </p>

                              <div className="mt-2 flex items-center justify-between text-12">
                                <span className="font-extrabold text-primary">
                                  {formatRupiah(totalTransfer)}
                                </span>
                                <span className="rounded-md bg-white border border-line/70 px-2 py-0.5 text-10 font-bold uppercase text-muted">
                                  {item.method}
                                </span>
                              </div>

                              <p className="mt-1 text-10 text-muted">
                                {formatDate(item.created_at)}
                              </p>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Detail of Selected Submission (7 Cols) */}
                <div className="flex flex-col rounded-2xl border border-line bg-white lg:col-span-7">
                  {activeDonation ? (
                    <div className="p-6 md:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
                        <div>
                          <p className="text-11 font-bold uppercase tracking-wider text-muted">
                            Detail Kiriman Terpilih
                          </p>
                          <h2 className="mt-1 text-20 font-extrabold text-ink font-mono">
                            {activeDonation.transaction_no}
                          </h2>
                        </div>
                        <StatusBadge status={activeDonation.status} />
                      </div>

                      <div className="mt-6 grid gap-6 md:grid-cols-12">
                        {/* Proof Photo Preview (5 cols) */}
                        <div className="md:col-span-5">
                          <p className="text-12 font-bold uppercase tracking-wider text-muted">
                            Bukti Pembayaran
                          </p>

                          <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface">
                            {activeDonation.proof_data_url ? (
                              <div className="group relative aspect-[3/4] w-full">
                                <img
                                  src={activeDonation.proof_data_url}
                                  alt="Bukti Transfer"
                                  className="size-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setImageModalOpen(true)}
                                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 text-white font-bold text-12"
                                >
                                  Perbesar Foto
                                </button>
                              </div>
                            ) : (
                              <div className="flex aspect-[3/4] flex-col items-center justify-center p-6 text-center text-muted">
                                <FileImageIcon className="size-12 text-muted/60" />
                                <p className="mt-3 text-12 font-bold text-ink">
                                  {activeDonation.proof_filename || 'bukti_transfer.jpg'}
                                </p>
                                <p className="mt-1 text-11 text-muted">
                                  Foto bukti transfer terunggah
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50/70 p-3 text-11 text-amber-900 border border-amber-200/60">
                            <InfoIcon className="size-3.5 shrink-0 mt-0.5 text-amber-700" />
                            <p className="leading-relaxed">
                              Cocokkan nominal transfer dan tanggal dengan mutasi rekening bank/QRIS.
                            </p>
                          </div>
                        </div>

                        {/* Data Details (7 cols) */}
                        <div className="space-y-4 md:col-span-7">
                          <div className="rounded-xl border border-line bg-primary-soft/40 p-4">
                            <p className="text-11 font-bold uppercase tracking-wider text-primary">
                              Total Transfer
                            </p>
                            <p className="mt-1 text-24 font-black text-primary">
                              {formatRupiah(activeDonation.amount + (activeDonation.unique_code || 0))}
                            </p>
                            <p className="mt-1 text-12 text-muted">
                              Nominal {formatRupiah(activeDonation.amount)} + Kode unik{' '}
                              <span className="font-bold text-ink">{activeDonation.unique_code || 0}</span>
                            </p>
                          </div>

                          <div className="space-y-3 rounded-xl border border-line bg-white p-4 text-13">
                            <div>
                              <p className="text-11 text-muted">Nama Donatur</p>
                              <p className="font-bold text-ink">
                                {activeDonation.donor_name}{' '}
                                {activeDonation.hide_name && (
                                  <span className="rounded-full bg-surface px-2 py-0.5 text-10 font-bold text-muted">
                                    Disembunyikan (Hamba Allah)
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="border-t border-line/50 pt-2.5">
                              <p className="text-11 text-muted">Kampanye Tujuan</p>
                              <p className="font-semibold text-ink">
                                {activeDonation.campaign_title || 'Bantu Operasi Jantung Bayi Alesha (6 Bulan)'}
                              </p>
                            </div>

                            <div className="border-t border-line/50 pt-2.5">
                              <p className="text-11 text-muted">Metode & Rekening Tujuan</p>
                              <p className="font-semibold text-ink uppercase">
                                {activeDonation.method} ·{' '}
                                {getPaymentMethod(activeDonation.method)?.accountNumber || 'Rekening Yayasan'}
                              </p>
                            </div>

                            {activeDonation.message && (
                              <div className="border-t border-line/50 pt-2.5">
                                <p className="text-11 text-muted">Pesan / Doa Donatur</p>
                                <p className="mt-0.5 italic text-muted">
                                  &ldquo;{activeDonation.message}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>

                          {activeDonation.rejection_reason && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-12 text-red-900">
                              <p className="font-bold">Alasan Penolakan Sebelumnya:</p>
                              <p className="mt-0.5">{activeDonation.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Verification Decision Row */}
                      <div className="mt-8 border-t border-line pt-6">
                        <h3 className="text-14 font-extrabold text-ink">Keputusan Verifikasi</h3>
                        <p className="text-12 text-muted">
                          Pilih tindakan untuk memperbarui status donasi ini.
                        </p>

                        <div className="mt-4">
                          <label className="block text-12 font-bold text-muted">
                            Catatan / Alasan Penolakan (opsional jika valid, wajib jika ditolak)
                          </label>
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Contoh: Bukti transfer terpotong, nominal tidak sesuai mutasi..."
                            className="mt-1.5 h-10 w-full rounded-xl border border-line bg-surface px-3.5 text-13 text-ink focus:border-primary focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <Button
                            variant="primary"
                            onClick={handleMarkValid}
                            className="flex-1 gap-2 font-bold shadow-sm"
                          >
                            <CircleCheckIcon className="size-4" />
                            Tandai Valid (Verifikasi)
                          </Button>

                          <Button
                            variant="danger"
                            onClick={handleMarkRejected}
                            className="flex-1 gap-2 font-bold shadow-sm"
                          >
                            <CircleXIcon className="size-4" />
                            Tandai Tidak Valid (Tolak)
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-96 flex-col items-center justify-center p-8 text-center text-muted">
                      <FileCheck2Icon className="size-12 text-muted/40" />
                      <p className="mt-3 text-14 font-semibold">Pilih salah satu kiriman untuk diperiksa</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
           * TAB B: KELOLA KAMPANYE (Tambah & Hapus Kampanye)
           * ===================================================== */}
          {adminTab === 'kampanye' && (
            <div>
              {/* Header Title & Actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-24 font-extrabold text-ink md:text-28">
                    Kelola Kampanye Donasi
                  </h1>
                  <p className="mt-1 text-14 text-muted">
                    Atur penggalangan dana aktif, tambah kampanye baru, atau hapus kampanye yang sudah selesai.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="primary"
                    onClick={() => setCreateModalOpen(true)}
                    className="gap-2 font-bold shadow-sm"
                  >
                    <PlusIcon className="size-4" />
                    <span>+ Tambah Kampanye Baru</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setResetConfirmOpen(true)}
                    className="gap-1.5 font-semibold text-13"
                    title="Kembalikan daftar ke 6 kampanye awal Figma"
                  >
                    <RotateCcwIcon className="size-4" />
                    <span>Reset ke Default</span>
                  </Button>
                </div>
              </div>

              {/* 3 Metric Cards for Campaigns */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-12 font-bold uppercase tracking-wider text-muted">
                      Kampanye Aktif
                    </p>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <LayersIcon className="size-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-28 font-black text-ink">{campaignList.length}</p>
                  <p className="mt-1 text-11 text-muted">Ditampilkan di publik</p>
                </div>

                <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-12 font-bold uppercase tracking-wider text-muted">
                      Total Target Dana
                    </p>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <HeartIcon className="size-4 fill-amber-700 stroke-amber-700" />
                    </span>
                  </div>
                  <p className="mt-2 text-22 font-black text-ink md:text-26">
                    {formatRupiah(campaignTotals.totalTarget)}
                  </p>
                  <p className="mt-1 text-11 text-muted">Akumulasi seluruh target</p>
                </div>

                <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-12 font-bold uppercase tracking-wider text-muted">
                      Total Donasi Terkumpul
                    </p>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <CircleCheckIcon className="size-4 text-primary" />
                    </span>
                  </div>
                  <p className="mt-2 text-22 font-black text-primary md:text-26">
                    {formatRupiah(campaignTotals.totalRaised)}
                  </p>
                  <p className="mt-1 text-11 text-muted">Dari donasi yang telah diverifikasi</p>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
                {/* Search Box */}
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                    <SearchIcon className="size-4" />
                  </div>
                  <input
                    type="text"
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    placeholder="Cari judul kampanye, inisiator, atau penerima manfaat..."
                    className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-4 text-13 text-ink focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-3">
                  <select
                    value={campaignCategory}
                    onChange={(e) => setCampaignCategory(e.target.value)}
                    aria-label="Filter kategori kampanye"
                    className="h-10 rounded-xl border border-line bg-surface px-3 text-13 text-ink focus:border-primary focus:bg-white focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'Semua' ? 'Semua Kategori' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campaign Cards List */}
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-line bg-white p-12 text-center shadow-xs">
                    <LayersIcon className="mx-auto size-12 text-muted/40" />
                    <h3 className="mt-3 text-18 font-bold text-ink">Tidak Ada Kampanye</h3>
                    <p className="mx-auto mt-2 max-w-md text-14 text-muted">
                      {campaignSearch
                        ? 'Tidak ada kampanye yang cocok dengan kata kunci pencarian.'
                        : 'Belum ada penggalangan dana aktif. Klik tombol di bawah untuk menambah kampanye baru.'}
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                      <Button
                        variant="primary"
                        onClick={() => setCreateModalOpen(true)}
                        className="gap-2 font-bold shadow-xs"
                      >
                        <PlusIcon className="size-4" />
                        Tambah Kampanye Baru
                      </Button>
                      {campaignSearch && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCampaignSearch('')
                            setCampaignCategory('Semua')
                          }}
                        >
                          Reset Pencarian
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  filteredCampaigns.map((camp) => (
                    <article
                      key={camp.id}
                      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-white shadow-xs transition-shadow hover:shadow-md"
                    >
                      <div>
                        {/* Thumbnail & Badges */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-primary-soft">
                          <img
                            src={camp.image}
                            alt={camp.title}
                            className="size-full object-cover"
                          />
                          <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-10 font-bold text-primary shadow-xs backdrop-blur-xs">
                            {camp.category}
                          </span>
                          <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-10 font-bold text-white backdrop-blur-xs">
                            {camp.daysLeft} hari lagi
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="line-clamp-2 text-15 font-bold leading-snug text-ink">
                            {camp.title}
                          </h3>

                          <div className="mt-2 flex items-center justify-between text-12 text-muted">
                            <span className="truncate">{camp.organizer}</span>
                            <span className="shrink-0 font-medium">
                              {camp.donorCount} Donatur
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="mt-3.5">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${Math.min(100, camp.percentage)}%` }}
                              />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-12">
                              <span className="font-bold text-ink">
                                {formatRupiah(camp.raised)}
                              </span>
                              <span className="text-muted">
                                Target {formatRupiah(camp.target)}
                              </span>
                            </div>
                            <p className="mt-1 text-11 text-muted">
                              {camp.percentage}% tercapai
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons (Lihat & Hapus) */}
                      <div className="flex items-center justify-between gap-2 border-t border-line/70 bg-surface/30 p-3.5">
                        <button
                          type="button"
                          onClick={() => setPreviewCampaign(camp)}
                          className="rounded-lg border border-line bg-white px-3 py-1.5 text-12 font-semibold text-ink transition-colors hover:bg-surface cursor-pointer"
                        >
                          Lihat Kisah
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(camp)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-12 font-bold text-danger transition-colors hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2Icon className="size-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================
       * 3. MODALS
       * ======================================================= */}
      {/* Lightbox Modal for Proof Image */}
      {imageModalOpen && activeDonation?.proof_data_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white p-2">
            <button
              type="button"
              onClick={() => setImageModalOpen(false)}
              className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <XIcon className="size-5" />
            </button>
            <img
              src={activeDonation.proof_data_url}
              alt="Bukti Transfer Penuh"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      {/* Modal Buat Kampanye Baru */}
      <CreateCampaignModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          setActionSuccessMessage('Kampanye baru berhasil ditambahkan dan langsung aktif di publik!')
          setTimeout(() => setActionSuccessMessage(''), 4000)
          refreshCampaigns()
        }}
      />

      {/* Modal Konfirmasi Hapus Kampanye */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 motion-safe:animate-overlay-in">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-[#FDFCF4] p-6 shadow-modal motion-safe:animate-modal-in"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-red-100 text-danger">
              <Trash2Icon className="size-6" />
            </div>

            <h3 className="mt-4 text-18 font-extrabold text-ink">Hapus Kampanye Ini?</h3>
            <p className="mt-2 text-13 leading-relaxed text-muted">
              Apakah Anda yakin ingin menghapus penggalangan dana{' '}
              <strong className="text-ink">&ldquo;{deleteConfirmItem.title}&rdquo;</strong>?
              Kampanye ini akan dihapus dari daftar dan tidak akan tampil lagi di beranda publik.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmItem(null)}
                className="font-semibold"
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDeleteCampaign}
                className="gap-2 font-bold shadow-xs"
              >
                <Trash2Icon className="size-4" />
                <span>Ya, Hapus Kampanye</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset Kampanye ke Default */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 motion-safe:animate-overlay-in">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-[#FDFCF4] p-6 shadow-modal motion-safe:animate-modal-in"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <RotateCcwIcon className="size-6" />
            </div>

            <h3 className="mt-4 text-18 font-extrabold text-ink">Reset ke 6 Kampanye Bawaan?</h3>
            <p className="mt-2 text-13 leading-relaxed text-muted">
              Tindakan ini akan mengembalikan daftar kampanye ke 6 kampanye awal sesuai desain Figma.
              Kampanye buatan baru yang belum disimpan terpisah akan terhapus.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setResetConfirmOpen(false)}
                className="font-semibold"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleResetCampaigns}
                className="gap-2 font-bold shadow-xs"
              >
                <span>Ya, Reset Sekarang</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Detail Preview Modal */}
      <CampaignDetailModal
        open={Boolean(previewCampaign)}
        onClose={() => setPreviewCampaign(null)}
        campaign={previewCampaign}
      />
    </div>
  )
}
