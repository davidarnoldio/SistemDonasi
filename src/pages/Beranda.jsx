import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CampaignDetailModal from '../components/campaign/CampaignDetailModal.jsx'
import DonationModal from '../components/donation/DonationModal.jsx'
import Button from '../components/ui/Button.jsx'
import {
  CircleCheckIcon,
  ClockIcon,
  HeartIcon,
} from '../components/ui/icons.jsx'
import { CATEGORIES, fallbackCampaign } from '../config/campaign.js'
import { useDonationFlow } from '../hooks/useDonationFlow.js'
import { getAllCampaigns } from '../lib/campaignStore.js'
import { formatRupiah } from '../lib/format.js'

function SparkleStar({ className, color = '#79AE6F' }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z"
        fill={color}
      />
    </svg>
  )
}

export default function Beranda() {
  const flow = useDonationFlow()
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailCampaign, setDetailCampaign] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [campaignList, setCampaignList] = useState(() => getAllCampaigns())

  const refreshCampaigns = useCallback(() => {
    setCampaignList(getAllCampaigns())
  }, [])

  useEffect(() => {
    window.addEventListener('kasihbersama_campaigns_updated', refreshCampaigns)
    window.addEventListener('kasihbersama_donations_updated', refreshCampaigns)
    return () => {
      window.removeEventListener('kasihbersama_campaigns_updated', refreshCampaigns)
      window.removeEventListener('kasihbersama_donations_updated', refreshCampaigns)
    }
  }, [refreshCampaigns])

  // Featured campaigns (up to 3)
  const featuredList = useMemo(() => {
    const featured = campaignList.filter((c) => c.isFeatured)
    return featured.length > 0 ? featured : campaignList.slice(0, 3)
  }, [campaignList])

  const currentFeatured = featuredList[featuredIndex] || campaignList[0] || fallbackCampaign

  // Filtered campaigns by category
  const filteredCampaigns = useMemo(() => {
    if (selectedCategory === 'Semua') return campaignList
    return campaignList.filter((c) => c.category === selectedCategory)
  }, [campaignList, selectedCategory])

  function openDonationFor(campaign) {
    flow.selectCampaign(campaign || fallbackCampaign)
    setModalOpen(true)
  }

  function openCampaignDetail(campaign) {
    setDetailCampaign(campaign)
    setDetailModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-[#F2EDC2]">
      {/* -------------------------------------------------------------
       * HERO SECTION (Background #EAF2E6 matching Figma)
       * ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#EAF2E6] py-12 md:py-20 border-b border-[#C8D9BF]">
        {/* Decorative soft circles & sparkles matching Figma */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-10 size-96 rounded-full bg-[#79AE6F]/20 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[#E9C46A]/25 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-10 -right-16 size-96 rounded-full bg-[#C8D9BF]/40 blur-2xl"
        />

        {/* Sparkles */}
        <SparkleStar
          className="pointer-events-none absolute left-8 top-12 size-6 opacity-70 animate-pulse"
          color="#79AE6F"
        />
        <SparkleStar
          className="pointer-events-none absolute left-[48%] top-20 size-4 opacity-80"
          color="#E9C46A"
        />
        <SparkleStar
          className="pointer-events-none absolute right-12 top-10 size-7 opacity-60 animate-pulse"
          color="#79AE6F"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-12 lg:gap-8">
          {/* Hero Copy (Left 7 Columns) */}
          <div className="lg:col-span-7">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C8D9BF] bg-[#FDFBF0] px-3.5 py-1.5 shadow-2xs">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#346739] text-white">
                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-12 font-bold text-[#346739]">
                Platform donasi terpercaya & transparan
              </span>
            </div>

            {/* Display Title */}
            <h1 className="mt-5 text-32 font-black tracking-tight text-[#111827] md:text-48 md:leading-[1.15]">
              Ulurkan Tangan, Sebarkan Kebaikan untuk Mereka yang Membutuhkan.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-15 leading-relaxed text-[#4B5563] md:text-16">
              Setiap donasi, sekecil apa pun, membantu anak-anak, keluarga, dan panti yang sedang
              berjuang. Semua kampanye terverifikasi dan dana tersalurkan langsung.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => openDonationFor(currentFeatured)}
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#79AE6F] px-7 py-3.5 text-15 font-bold text-white shadow-md transition-all hover:bg-[#689B5F] hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
              >
                <HeartIcon className="size-5 fill-white stroke-white" />
                Mulai Berdonasi
              </button>
              <a
                href="#kampanye"
                className="inline-flex items-center justify-center rounded-xl border border-[#346739] bg-[#FDFBF0] px-7 py-3.5 text-15 font-bold text-[#346739] shadow-2xs transition-all hover:bg-[#EAF2E6] hover:scale-[1.02] active:scale-[0.99]"
              >
                Lihat Kampanye
              </a>
            </div>

            {/* Stats Metrics (Platform stats from Figma) */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-[#C8D9BF] pt-8">
              <div>
                <p className="text-22 font-extrabold text-[#346739] md:text-26">Rp 2,4 M</p>
                <p className="mt-0.5 text-12 font-medium text-[#6B7280]">Dana tersalurkan</p>
              </div>
              <div className="border-l border-[#C8D9BF] pl-4">
                <p className="text-22 font-extrabold text-[#111827] md:text-26">18.320</p>
                <p className="mt-0.5 text-12 font-medium text-[#6B7280]">Donatur</p>
              </div>
              <div className="border-l border-[#C8D9BF] pl-4">
                <p className="text-22 font-extrabold text-[#111827] md:text-26">1.204</p>
                <p className="mt-0.5 text-12 font-medium text-[#6B7280]">Kampanye</p>
              </div>
            </div>
          </div>

          {/* Featured Campaign Carousel Card (Right 5 Columns) */}
          <div className="lg:col-span-5">
            <article className="group overflow-hidden rounded-[24px] border border-[#C8D9BF] bg-[#FDFBF0] shadow-modal transition-shadow duration-300 hover:shadow-xl">
              {/* Illustration Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#C8D9BF]">
                <img
                  src={currentFeatured?.heroImage || currentFeatured?.image || '/illustrations/hero.svg'}
                  alt={currentFeatured?.title || 'Kampanye'}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-[#79AE6F] px-3.5 py-1 text-11 font-extrabold text-white shadow-sm">
                  Kampanye Unggulan
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h2 className="text-18 font-bold leading-snug text-[#111827] md:text-20 line-clamp-2">
                  {currentFeatured?.title}
                </h2>

                <div className="mt-2.5 flex items-center gap-1.5 text-13 text-[#6B7280]">
                  <span>{currentFeatured?.organizer}</span>
                  <CircleCheckIcon className="size-4 text-[#346739]" />
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#C8D9BF]">
                    <div
                      className="h-full rounded-full bg-[#346739] transition-all duration-500"
                      style={{ width: `${Math.min(100, currentFeatured?.percentage || 0)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-13">
                    <span className="font-extrabold text-[#346739]">
                      {formatRupiah(currentFeatured?.raised || 0)}
                    </span>
                    <span className="text-[#6B7280]">
                      dari {formatRupiah(currentFeatured?.target || 50000000)} · {currentFeatured?.daysLeft || 12} hari lagi
                    </span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-1 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openCampaignDetail(currentFeatured)}
                      className="rounded-xl border border-[#346739] bg-[#FDFBF0] px-4 py-2.5 text-13 font-semibold text-[#346739] transition-colors hover:bg-[#EAF2E6] cursor-pointer"
                    >
                      Baca Kisah
                    </button>
                    <button
                      type="button"
                      onClick={() => openDonationFor(currentFeatured)}
                      className="flex-1 rounded-xl bg-[#79AE6F] px-5 py-2.5 text-14 font-bold text-white shadow-xs transition-colors hover:bg-[#689B5F] cursor-pointer"
                    >
                      Donasi Sekarang
                    </button>
                  </div>

                  {/* Carousel Dots */}
                  {featuredList.length > 1 && (
                    <div
                      className="flex items-center gap-1.5"
                      role="tablist"
                      aria-label="Kampanye unggulan carousel"
                    >
                      {featuredList.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={featuredIndex === idx}
                          aria-label={`Slide ${idx + 1}`}
                          onClick={() => setFeaturedIndex(idx)}
                          className={`size-2.5 rounded-full transition-all cursor-pointer ${
                            featuredIndex === idx ? 'w-6 bg-[#346739]' : 'bg-[#C8D9BF] hover:bg-[#346739]/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
       * CAMPAIGNS SECTION (Background #F2EDC2 matching Figma)
       * ----------------------------------------------------------- */}
      <section id="kampanye" className="mx-auto max-w-6xl px-6 py-14 md:py-20 scroll-mt-20">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-28 font-black tracking-tight text-[#111827] md:text-36">
              Kampanye Pilihan
            </h2>
          </div>
          <Link
            to="/donatur"
            className="text-14 font-bold text-[#346739] transition-colors hover:underline"
          >
            Lihat semua →
          </Link>
        </div>

        {/* Category Filter Chips (Figma style: rounded-full, active #79AE6F, inactive #FDFBF0 border #C8D9BF) */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5" role="group" aria-label="Kategori kampanye">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={isSelected}
                className={`rounded-full px-5 py-2 text-14 font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#79AE6F] text-white font-bold shadow-xs'
                    : 'border border-[#C8D9BF] bg-[#FDFBF0] text-[#111827] hover:bg-white'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* Campaign Cards Grid (2 rows x 3 columns in desktop) */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-[#C8D9BF] bg-[#FDFBF0] p-12 text-center shadow-xs">
              <HeartIcon className="mx-auto size-12 text-[#6B7280]/30" />
              <h3 className="mt-3 text-18 font-bold text-[#111827]">Belum Ada Kampanye</h3>
              <p className="mx-auto mt-2 max-w-md text-14 text-[#6B7280]">
                Belum ada kampanye untuk kategori &ldquo;{selectedCategory}&rdquo;.
              </p>
            </div>
          ) : (
            filteredCampaigns.map((camp) => (
              <article
                key={camp.id}
                className="flex flex-col overflow-hidden rounded-[16px] border border-[#C8D9BF] bg-[#FDFBF0] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Card Illustration */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#C8D9BF]">
                  <img
                    src={camp.image}
                    alt={camp.title}
                    className="size-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                  {/* Category Pill matching Figma id="Category" */}
                  <span className="absolute left-3.5 top-3.5 rounded-full bg-[#EAF2E6] px-3 py-1 text-11 font-bold text-[#346739] shadow-2xs">
                    {camp.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="line-clamp-2 text-16 font-bold leading-snug text-[#111827] hover:text-[#346739] transition-colors">
                      {camp.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5 text-12 text-[#6B7280]">
                      <span className="truncate">{camp.organizer}</span>
                      <CircleCheckIcon className="size-3.5 shrink-0 text-[#346739]" />
                    </div>

                    {/* Progress track */}
                    <div className="mt-4">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#C8D9BF]">
                        <div
                          className="h-full rounded-full bg-[#346739] transition-all duration-300"
                          style={{ width: `${Math.min(100, camp.percentage)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-12">
                        <span className="font-bold text-[#111827]">{formatRupiah(camp.raised)}</span>
                        <span className="text-[#6B7280]">dari {formatRupiah(camp.target)}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-12">
                        <span className="text-[#6B7280]">{camp.percentage}% tercapai</span>
                        <div className="flex items-center gap-1 text-11 text-[#6B7280]">
                          <ClockIcon className="size-3.5" />
                          <span>{camp.daysLeft} hari lagi</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Row: Baca Kisah & Donasi */}
                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#C8D9BF]/70 pt-4">
                    <button
                      type="button"
                      onClick={() => openCampaignDetail(camp)}
                      className="rounded-lg border border-[#346739] bg-[#FDFBF0] px-3 py-1.5 text-12 font-semibold text-[#346739] transition-colors hover:bg-[#EAF2E6] cursor-pointer"
                    >
                      Baca Kisah
                    </button>
                    <button
                      type="button"
                      onClick={() => openDonationFor(camp)}
                      className="rounded-lg bg-[#79AE6F] px-4 py-1.5 text-12 font-bold text-white shadow-2xs transition-colors hover:bg-[#689B5F] cursor-pointer"
                    >
                      Donasi
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Campaign Detail ("Baca Kisah") Modal */}
      <CampaignDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        campaign={detailCampaign}
        onDonateClick={(c) => {
          setDetailModalOpen(false)
          openDonationFor(c)
        }}
      />

      {/* 4-Step Donation Flow Modal */}
      <DonationModal open={modalOpen} onClose={() => setModalOpen(false)} flow={flow} />
    </main>
  )
}
