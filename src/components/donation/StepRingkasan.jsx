import { Link } from 'react-router-dom'
import { getPaymentMethod } from '../../config/payment.js'
import { formatRupiah } from '../../lib/format.js'
import Button from '../ui/Button.jsx'
import { PendingArt, SuccessArt } from '../ui/icons.jsx'
import Notice from '../ui/Notice.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'

function SummaryRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink break-words max-w-[240px]">{children}</dd>
    </div>
  )
}

/**
 * Langkah 4b: invoice transaksi donasi (sesuai langkah-4-invoice-sukses-1.svg).
 */
export default function StepRingkasan({ flow, onClose, isVerified = false }) {
  const { transactionNo, amount, method, savedRemotely, campaign } = flow
  const payment = getPaymentMethod(method)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center text-center">
        {isVerified ? (
          <>
            <SuccessArt className="mt-px" />
            <h3 className="mt-5 text-24 font-extrabold text-ink">Donasi Berhasil!</h3>
            <p className="mt-2 text-14 text-muted">
              Terima kasih, semoga kebaikanmu dibalas berlipat ganda.
            </p>
          </>
        ) : (
          <>
            <PendingArt className="mt-px" />
            <h3 className="mt-5 text-24 font-extrabold text-ink">Menunggu Konfirmasi</h3>
            <p className="mt-2 text-14 text-muted">
              Pembayaranmu sedang diproses. Tunggu konfirmasi selanjutnya.
            </p>
          </>
        )}
      </div>

      <section aria-label="Ringkasan Transaksi" className="rounded-2xl border border-line/60 bg-white p-5 text-13 shadow-xs">
        <h4 className="mb-3 text-13 font-bold text-ink">Ringkasan Transaksi</h4>
        <dl className="flex flex-col gap-3.5">
          <SummaryRow label="No. Transaksi">{transactionNo}</SummaryRow>
          <SummaryRow label="Kampanye">{campaign.title}</SummaryRow>
          <SummaryRow label="Nominal Donasi">{formatRupiah(amount)}</SummaryRow>
          <SummaryRow label="Metode">{payment?.label || 'QRIS'}</SummaryRow>
          <div className="flex items-center justify-between gap-4 border-t border-line/40 pt-3">
            <dt className="text-muted">Status</dt>
            <dd>
              <StatusBadge status={isVerified ? 'verified' : 'pending'} />
            </dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-col gap-2.5">
        <Button onClick={onClose} className="w-full font-bold">
          Kembali ke Beranda
        </Button>
        <Button as={Link} to="/donatur" variant="outline" onClick={onClose} className="w-full">
          Lihat Daftar Donatur
        </Button>
      </div>
    </div>
  )
}
