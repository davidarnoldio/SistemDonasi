import { getPaymentMethod } from '../../config/payment.js'
import { HIDDEN_NAME } from '../../hooks/useDonationFlow.js'
import { formatRupiah } from '../../lib/format.js'
import Button from '../ui/Button.jsx'
import { InfoIcon, ShieldCheckIcon } from '../ui/icons.jsx'
import Notice from '../ui/Notice.jsx'
import ActionRow from './ActionRow.jsx'
import ProofUpload from './ProofUpload.jsx'

/**
 * Langkah 4: Upload Bukti Pembayaran (Sesuai persis dengan design/langkah-4-upload-bukti.svg)
 */
export default function StepInstruksi({ flow }) {
  const {
    method,
    amount,
    name,
    hideName,
    campaign,
    uniqueCode,
    total,
    transactionNo,
    proofFile,
    proofError,
    submitError,
    isSubmitting,
    isDemoMode,
    selectProof,
    clearProof,
    goBack,
    submit,
  } = flow

  const payment = getPaymentMethod(method)
  const donorDisplayName = hideName ? HIDDEN_NAME : name.trim() || HIDDEN_NAME

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="flex flex-col gap-5"
    >
      {/* 1. DONATION SUMMARY (Donation summary in SVG) */}
      <section
        aria-label="Ringkasan Donasi"
        className="rounded-2xl border border-line bg-surface p-4 text-13 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <span className="font-semibold text-muted">Total Donasi</span>
          <span className="text-17 font-black text-primary">{formatRupiah(total)}</span>
        </div>

        <div className="mt-3 space-y-2 text-12">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted">Kampanye</span>
            <span className="max-w-[240px] truncate font-bold text-ink" title={campaign.title}>
              {campaign.title}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted">Nama Donatur</span>
            <span className="font-semibold text-ink">{donorDisplayName}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted">Metode Pembayaran</span>
            <span className="font-semibold text-ink">{payment?.label || 'Transfer Bank'}</span>
          </div>
          {transactionNo && (
            <div className="flex items-center justify-between gap-4 pt-1 text-11 text-muted">
              <span>ID Transaksi</span>
              <span className="font-mono">{transactionNo}</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. PAYMENT PROOF UPLOAD AREA (Payment proof in SVG) */}
      <ProofUpload
        file={proofFile}
        error={proofError}
        disabled={isSubmitting}
        onSelect={selectProof}
        onClear={clearProof}
      />

      {/* 3. VERIFICATION NOTICE (Verification notice in SVG) */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary-soft p-3.5 text-12 text-primary font-medium leading-relaxed">
        <InfoIcon className="size-4 shrink-0 mt-0.5 text-primary" />
        <p>
          Bukti pembayaran akan diverifikasi oleh admin maksimal 1x24 jam kerja. Setelah diverifikasi,
          namamu akan langsung tercatat di <strong>Daftar Donatur Kebaikan</strong>.
        </p>
      </div>

      {submitError && (
        <Notice tone="danger" role="alert">
          {submitError}
        </Notice>
      )}

      {/* 4. ACTIONS (Kembali + Kirim Bukti Pembayaran) */}
      <div>
        <ActionRow layout="back-primary">
          <Button
            variant="outline"
            type="button"
            onClick={goBack}
            disabled={isSubmitting}
            className="min-w-28"
          >
            Kembali
          </Button>
          <Button
            type="submit"
            disabled={!proofFile || isSubmitting}
            loading={isSubmitting}
            className="font-bold shadow-md"
            aria-describedby={proofFile ? undefined : 'kirim-bukti-bantuan'}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
          </Button>
        </ActionRow>

        {!proofFile ? (
          <p id="kirim-bukti-bantuan" className="mt-2.5 text-center text-11 text-muted">
            Pilih atau unggah gambar bukti transfer terlebih dahulu.
          </p>
        ) : (
          <p className="mt-2.5 text-center text-11 text-muted">
            Dengan mengklik tombol di atas, Anda menyatakan bahwa bukti transfer yang diunggah adalah asli.
          </p>
        )}
      </div>
    </form>
  )
}
