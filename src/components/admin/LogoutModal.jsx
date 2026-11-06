import Button from '../ui/Button.jsx'
import { LogOutIcon, XIcon } from '../ui/icons.jsx'

export default function LogoutModal({ open, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 motion-safe:animate-overlay-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        className="w-full max-w-[420px] overflow-hidden rounded-3xl bg-[#FDFCF4] p-6 shadow-modal motion-safe:animate-modal-in sm:p-7"
      >
        <div className="flex items-center justify-between">
          <p className="text-12 font-bold uppercase tracking-wider text-muted">
            Konfirmasi Keluar
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-ink"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100 text-danger">
            <LogOutIcon className="size-7" />
          </div>

          <h3 id="logout-dialog-title" className="mt-4 text-20 font-extrabold text-ink">
            Apakah Anda yakin ingin keluar?
          </h3>

          <p className="mt-2 text-13 text-muted">
            Sesi admin Anda akan diakhiri. Anda perlu memasukkan email dan kata sandi kembali untuk
            mengakses portal verifikasi donasi.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1 font-bold">
            Ya, Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

