import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DonationModal from '../components/donation/DonationModal.jsx'
import Button from '../components/ui/Button.jsx'
import {
  CircleCheckIcon,
  HeartIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '../components/ui/icons.jsx'
import Notice from '../components/ui/Notice.jsx'
import { fallbackCampaign } from '../config/campaign.js'
import { useDonationFlow } from '../hooks/useDonationFlow.js'
import { getAllCampaigns } from '../lib/campaignStore.js'
import { DonationError, getVerifiedDonors } from '../lib/donations.js'
import { formatDate, formatRupiah } from '../lib/format.js'
import { getStoredDonations } from '../lib/simulationStore.js'
import { isSupabaseConfigured } from '../lib/supabase.js'

function getVerifiedDonorsFromStore() {
  try {
    const list = getStoredDonations()
    return (list || []).filter((d) => d && d.status === 'verified')
  } catch {
    return []
  }
}

export default function DaftarDonatur() {
  const flow = useDonationFlow()
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState('all')
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'highest' | 'oldest'
  const [campaignList, setCampaignList] = useState(() => getAllCampaigns())

  useEffect(() => {
    function handleCampaigns() {
      setCampaignList(getAllCampaigns())
    }
    window.addEventListener('kasihbersama_campaigns_updated', handleCampaigns)
    return () => window.removeEventListener('kasihbersama_campaigns_updated', handleCampaigns)
  }, [])

  const [state, setState] = useState(() => ({
    status: isSupabaseConfigured ? 'loading' : 'ready',
    donors: getVerifiedDonorsFromStore(),
    error: null,
  }))

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const verified = getVerifiedDonorsFromStore()
      setState({ status: 'ready', donors: verified, error: null })
      return
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }))
    try {
      const donors = await getVerifiedDonors()
      if (Array.isArray(donors)) {
        setState({ status: 'ready', donors: donors, error: null })
      } else {
        setState({ status: 'ready', donors: getVerifiedDonorsFromStore(), error: null })
      }
    } catch (error) {
      const fallback = getVerifiedDonorsFromStore()
      const msg = error instanceof DonationError ? error.message : 'Gagal memuat dari database.'
      setState({
        status: 'ready',
        donors: fallback,
        error: `${msg} (Menampilkan data lokal)`,
      })
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('kasihbersama_donations_updated', load)
    return () => window.removeEventListener('kasihbersama_donations_updated', load)
  }, [load])

  // Filtered & Sorted donors
  const filteredDonors = useMemo(() => {
    let list = [...(state.donors || [])]

    if (selectedCampaign !== 'all') {
      list = list.filter((d) => {
        if (!d) return false
        return (
          d.campaign_slug === selectedCampaign ||
          (d.campaign_title && d.campaign_title.toLowerCase().includes(selectedCampaign.toLowerCase()))
        )
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((d) => {
        if (!d) return false
        const name = String(d.display_name || d.donor_name || '').toLowerCase()
        const msg = String(d.message || '').toLowerCase()
        const camp = String(d.campaign_title || '').toLowerCase()
        return name.includes(q) || msg.includes(q) || camp.includes(q)
      })
    }

    list.sort((a, b) => {
      const amountA = Number(a?.amount) || 0
      const amountB = Number(b?.amount) || 0
      if (sortBy === 'highest') {
        return amountB - amountA
      }
      const timeA = new Date(a?.created_at || 0).getTime() || 0
      const timeB = new Date(b?.created_at || 0).getTime() || 0
      return sortBy === 'oldest' ? timeA - timeB : timeB - timeA
    })

    return list
  }, [state.donors, selectedCampaign, searchQuery, sortBy])

  const totalDana = useMemo(() => {
    return (state.donors || []).reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0)
  }, [state.donors])

  return (
    <main className="min-h-screen bg-cream-soft pb-20">
      {/* HERO / HEADER SECTION */}
      <section className="border-b border-line/70 bg-gradient-to-b from-white via-cream-soft to-cream-soft pt-8 pb-10">
        <div className="mx-auto max-w-6xl px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-13 font-semibold text-primary transition-colors hover:underline"
          >
            ← Kembali ke Beranda
          </Link>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-12 font-bold text-primary">
                <ShieldCheckIcon className="size-4" />
                <span>100% Transparan & Terverifikasi</span>
              </div>
              <h1 className="mt-3 text-28 font-black tracking-tight text-ink md:text-36">
                Daftar Donatur Kebaikan
              </h1>
              <p className="mt-2 max-w-2xl text-14 leading-relaxed text-muted md:text-15">
                Setiap donasi di bawah ini telah diverifikasi bukti pembayarannya secara manual oleh tim
                pengelola KasihBersama untuk menjaga integritas dan amanah penyaluran dana.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                flow.selectCampaign(campaignList[0] || fallbackCampaign)
                setModalOpen(true)
              }}
              className="gap-2 font-bold shadow-md hover:scale-[1.02] transition-transform shrink-0"
            >
              <HeartIcon className="size-4 fill-white stroke-white" />
              Mulai Berdonasi
            </Button>
          </div>

          {/* Metric Stats Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line/70 bg-white p-4 shadow-xs">
              <p className="text-11 font-bold uppercase tracking-wider text-muted">
                Donasi Terverifikasi
              </p>
              <p className="mt-1 text-20 font-black text-primary md:text-24">
                {formatRupiah(totalDana)}
              </p>
              <p className="mt-0.5 text-11 text-muted">Total dana terverifikasi</p>
            </div>

            <div className="rounded-2xl border border-line/70 bg-white p-4 shadow-xs">
              <p className="text-11 font-bold uppercase tracking-wider text-muted">
                Jumlah Donatur
              </p>
              <p className="mt-1 text-20 font-black text-ink md:text-24">
                {(state.donors || []).length} Orang
              </p>
              <p className="mt-0.5 text-11 text-muted">Tercatat secara publik</p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-line/70 bg-white p-4 shadow-xs">
              <p className="text-11 font-bold uppercase tracking-wider text-muted">
                Audit Manual
              </p>
              <p className="mt-1 text-20 font-black text-ink md:text-24">
                100% Valid
              </p>
              <p className="mt-0.5 text-11 text-muted">Cek mutasi & bukti struk</p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & DONORS LIST SECTION */}
      <section className="mx-auto max-w-6xl px-6 pt-8">
        {state.error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-13 text-amber-900">
            {state.error}
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-line/70 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
              <SearchIcon className="size-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama donatur, doa, atau kampanye..."
              className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-4 text-13 text-ink focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          {/* Campaign Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              aria-label="Filter berdasarkan kampanye"
              className="h-10 rounded-xl border border-line bg-surface px-3 text-13 text-ink focus:border-primary focus:bg-white focus:outline-none"
            >
              <option value="all">Semua Kampanye</option>
              {campaignList.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Urutkan donatur"
              className="h-10 rounded-xl border border-line bg-surface px-3 text-13 text-ink focus:border-primary focus:bg-white focus:outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="highest">Nominal Terbesar</option>
              <option value="oldest">Paling Awal</option>
            </select>
          </div>
        </div>

        {/* Donor Cards Grid */}
        <div className="mt-6">
          {filteredDonors.length === 0 ? (
            <div className="rounded-2xl border border-line/70 bg-white p-12 text-center shadow-xs">
              <UsersIcon className="mx-auto size-12 text-muted/40" />
              <h3 className="mt-3 text-18 font-bold text-ink">Belum Ada Donasi Terverifikasi</h3>
              <p className="mx-auto mt-2 max-w-md text-14 text-muted">
                {searchQuery
                  ? 'Tidak ada donatur yang sesuai dengan kata kunci pencarian Anda.'
                  : 'Jadilah donatur pertama yang menebar kebaikan! Bukti transfer akan diverifikasi oleh pengelola.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    flow.selectCampaign(campaignList[0] || fallbackCampaign)
                    setModalOpen(true)
                  }}
                  className="font-bold shadow-sm"
                >
                  Mulai Berdonasi Sekarang
                </Button>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCampaign('all')
                    }}
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {filteredDonors.map((donor, idx) => {
                const name =
                  donor?.display_name ||
                  (donor?.hide_name ? 'Hamba Allah' : donor?.donor_name || 'Hamba Allah')
                const isAnonymous = donor?.hide_name || name === 'Hamba Allah'
                const initial = isAnonymous
                  ? 'H'
                  : String(name).trim().charAt(0).toUpperCase() || 'D'
                const amountNum = Number(donor?.amount) || 0

                return (
                  <article
                    key={donor?.id || donor?.transaction_no || idx}
                    className="flex flex-col justify-between rounded-2xl border border-line/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
                  >
                    <div>
                      {/* Donor Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-15 font-extrabold text-primary border border-primary/20"
                          >
                            {initial}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-14 font-bold text-ink">{name}</h3>
                              <CircleCheckIcon className="size-4 text-primary shrink-0" />
                            </div>
                            <p className="text-11 text-muted">
                              {formatDate(donor?.created_at || new Date().toISOString())}
                            </p>
                          </div>
                        </div>

                        {/* Amount Badge */}
                        <div className="text-right">
                          <p className="text-15 font-black text-primary">
                            {formatRupiah(amountNum)}
                          </p>
                          <span className="inline-flex items-center gap-1 text-10 font-bold text-sage">
                            <span className="size-1.5 rounded-full bg-sage" />
                            Terverifikasi
                          </span>
                        </div>
                      </div>

                      {/* Campaign Badge */}
                      {donor?.campaign_title && (
                        <div className="mt-3.5">
                          <span className="inline-block rounded-lg bg-surface px-2.5 py-1 text-11 font-medium text-muted line-clamp-1">
                            {donor.campaign_title}
                          </span>
                        </div>
                      )}

                      {/* Prayer / Support Message */}
                      {donor?.message && (
                        <div className="mt-3 rounded-xl bg-[#FDFCF4] p-3 text-13 text-ink/90 border border-line/60">
                          <p className="italic leading-relaxed">
                            &ldquo;{donor.message}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Transaction Tag */}
                    {donor?.transaction_no && (
                      <div className="mt-4 flex items-center justify-between border-t border-line/50 pt-2.5 text-10 text-muted">
                        <span>ID: {donor.transaction_no}</span>
                        <span className="uppercase font-semibold">{donor?.method || 'Transfer'}</span>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary-soft via-white to-primary-soft p-8 text-center shadow-xs">
          <HeartIcon className="mx-auto size-10 fill-primary stroke-primary" />
          <h2 className="mt-3 text-20 font-extrabold text-ink md:text-24">
            Ingin Namamu dan Doamu Tercatat di Sini?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-14 text-muted">
            Setiap bantuan membawa harapan baru bagi mereka yang membutuhkan. Mulai donasi sekarang
            dengan nominal mulai dari Rp 10.000.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                flow.selectCampaign(campaignList[0] || fallbackCampaign)
                setModalOpen(true)
              }}
              className="gap-2 px-8 font-bold shadow-md"
            >
              Donasi Sekarang
            </Button>
            <Button as={Link} to="/" variant="outline">
              Jelajahi Kampanye
            </Button>
          </div>
        </div>
      </section>

      {/* Donation Modal */}
      <DonationModal open={modalOpen} onClose={() => setModalOpen(false)} flow={flow} />
    </main>
  )
}
