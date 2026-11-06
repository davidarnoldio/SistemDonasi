import Button from '../ui/Button.jsx'
import { CircleXIcon, XIcon } from '../ui/icons.jsx'

export default function FailedDonationModal({ open, onClose, onRetry, message }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 motion-safe:animate-overlay-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="failed-donation-title"
        className="w-full max-w-[420px] overflow-hidden rounded-3xl bg-[#FDFCF4] p-6 text-center shadow-modal motion-safe:animate-modal-in sm:p-7"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-ink"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100 text-danger">
          <CircleXIcon className="size-10" />
        </div>

        <h3 id="failed-donation-title" className="mt-4 text-20 font-extrabold text-ink">
          Donasi Tidak Berhasil
        </h3>
        <p className="mt-2 text-14 leading-relaxed text-muted">
          {message ||
            'Mohon maaf, terjadi kendala saat memproses bukti donasi Anda. Silakan coba kembali.'}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button variant="primary" onClick={onRetry} className="w-full font-bold">
            Coba Lagi
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  )
}

