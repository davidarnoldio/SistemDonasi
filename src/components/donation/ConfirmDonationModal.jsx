import Button from '../ui/Button.jsx'
import { AlertCircleIcon, XIcon } from '../ui/icons.jsx'
import { formatRupiah } from '../../lib/format.js'

export default function ConfirmDonationModal({ open, onClose, onConfirm, flow }) {
  if (!open) return null

  const methodLabels = {
    qris: 'QRIS / QR Code',
    bca: 'Bank BCA',
    seabank: 'SeaBank',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 motion-safe:animate-overlay-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-donation-title"
        className="w-full max-w-[460px] overflow-hidden rounded-3xl bg-[#FDFCF4] p-6 shadow-modal motion-safe:animate-modal-in sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 id="confirm-donation-title" className="text-20 font-extrabold text-ink">
              Konfirmasi Donasi
            </h3>
            <p className="mt-1 text-13 text-muted">Apakah Anda yakin ingin berdonasi?</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-ink"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Campaign Info */}
        <div className="mt-5 rounded-2xl border border-line/70 bg-white p-4">
          <p className="text-11 font-semibold uppercase tracking-wide text-primary">Donasi untuk</p>
          <p className="mt-1 text-14 font-bold text-ink line-clamp-2">{flow.campaign.title}</p>
        </div>

        {/* Donation Details */}
        <div className="mt-4 space-y-3 rounded-2xl border border-line/70 bg-white p-4 text-13">
          <div className="flex items-center justify-between">
            <span className="text-muted">Nominal donasi</span>
            <span className="font-bold text-ink">{formatRupiah(flow.amount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-line/50 pt-2.5">
            <span className="text-muted">Metode pembayaran</span>
            <span className="font-semibold text-ink">{methodLabels[flow.method] || 'QR Code'}</span>
          </div>
          <div className="flex items-center justify-between border-t border-line/50 pt-2.5">
            <span className="text-muted">Status</span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-11 font-bold text-amber-700">
              Belum dibayar
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50/70 p-3 text-12 text-amber-900 border border-amber-200/60">
          <AlertCircleIcon className="size-4 shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-relaxed">
            Pastikan nominal dan metode pembayaran sudah sesuai. Setelah Anda konfirmasi, Anda akan
            melanjutkan ke pembayaran.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button variant="primary" onClick={onConfirm} className="flex-1 font-bold">
            Ya, saya yakin
          </Button>
        </div>
      </div>
    </div>
  )
}

