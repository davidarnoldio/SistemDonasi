import { formatRupiah } from '../../lib/format.js'
import Button from '../ui/Button.jsx'
import {
  CircleCheckIcon,
  ClockIcon,
  HeartIcon,
  ShieldCheckIcon,
  UsersIcon,
  XIcon,
} from '../ui/icons.jsx'

export default function CampaignDetailModal({ open, onClose, campaign, onDonateClick }) {
  if (!open || !campaign) return null

  const percentage = Math.min(100, campaign.percentage || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-3 sm:p-4 motion-safe:animate-overlay-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-detail-title"
        className="flex max-h-[92dvh] w-full max-w-[540px] flex-col overflow-hidden rounded-2xl bg-[#FDFCF4] shadow-modal motion-safe:animate-modal-in"
      >
        {/* Hero Image Header (Shrink-0) */}
        <div className="relative aspect-[16/8] w-full overflow-hidden bg-primary-soft shrink-0">
          <img
            src={campaign.heroImage || campaign.image}
            alt={campaign.title}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Badges */}
          <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5">
            <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-10 font-extrabold text-primary shadow-xs backdrop-blur-xs">
              {campaign.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-10 font-extrabold text-ink shadow-xs">
              <ShieldCheckIcon className="size-3" />
              Terverifikasi
            </span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="absolute right-3.5 top-3.5 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <XIcon className="size-4" />
          </button>

          {/* Title on image overlay */}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 id="campaign-detail-title" className="text-16 font-extrabold text-white md:text-18 leading-snug drop-shadow-sm line-clamp-2">
              {campaign.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Organizer Row */}
          <div className="flex items-center justify-between border-b border-line/70 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-13 font-extrabold text-primary border border-primary/20">
                {campaign.organizer.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-10 font-semibold text-muted">Penggalang Dana</p>
                <div className="flex items-center gap-1">
                  <h3 className="text-13 font-bold text-ink">{campaign.organizer}</h3>
                  <CircleCheckIcon className="size-3.5 text-primary" />
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-11 font-semibold text-muted">
                <ClockIcon className="size-3" />
                {campaign.daysLeft} hari lagi
              </span>
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="rounded-xl border border-line/70 bg-white p-4 shadow-xs">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-10 font-semibold uppercase tracking-wider text-muted">Dana Terkumpul</p>
                <p className="text-20 font-black text-primary md:text-22">
                  {formatRupiah(campaign.raised)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-10 font-semibold uppercase tracking-wider text-muted">Target</p>
                <p className="text-13 font-bold text-ink">{formatRupiah(campaign.target)}</p>
              </div>
            </div>

            {/* Progress track */}
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-11 text-muted">
              <span className="font-bold text-primary">{percentage}% tercapai</span>
              <span className="inline-flex items-center gap-1">
                <UsersIcon className="size-3" />
                {campaign.donorCount} donatur
              </span>
            </div>
          </div>

          {/* Story & Background Section */}
          <div>
            <h4 className="text-14 font-extrabold text-ink">Kisah & Latar Belakang</h4>
            <div className="mt-1.5 space-y-2 text-13 leading-relaxed text-ink/80">
              <p>{campaign.story || campaign.description}</p>
              <p className="text-12 text-muted">
                Setiap donasi disalurkan secara amanah dengan bukti mutasi dan verifikasi berkas administrasi.
              </p>
            </div>
          </div>

          {/* Transparency Commitment Notice */}
          <div className="rounded-xl border border-primary/20 bg-primary-soft p-3 text-11 text-primary font-medium leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-12">
              <ShieldCheckIcon className="size-3.5" />
              <span>Jaminan Penyaluran Amanah</span>
            </div>
            <p className="mt-0.5">
              Yayasan Kasih Bersama melakukan verifikasi berkas sebelum menyalurkan dana donasi.
            </p>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-line/70 bg-white px-5 py-3">
          <Button size="sm" variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              onClose()
              if (onDonateClick) onDonateClick(campaign)
            }}
            className="gap-1.5 font-bold shadow-xs px-5"
          >
            <HeartIcon className="size-3.5 fill-white stroke-white" />
            Donasi Sekarang
          </Button>
        </div>
      </div>
    </div>
  )
}
