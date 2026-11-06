import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useRef, useState } from 'react'
import { getPaymentMethod } from '../../config/payment.js'
import { copyText } from '../../lib/clipboard.js'
import { formatRupiah } from '../../lib/format.js'
import Button from '../ui/Button.jsx'
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  QrCodeIcon,
  UploadCloudIcon,
} from '../ui/icons.jsx'
import ActionRow from './ActionRow.jsx'

const QR_FOREGROUND = '#111827'
const QR_BACKGROUND = '#FFFFFF'

/** Tombol salin serbaguna dengan animasi feedback 'Tersalin' */
function CopyBadgeButton({ text, ariaLabel = 'Salin ke clipboard' }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function handleCopy() {
    const success = await copyText(String(text))
    if (success) {
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-lg px-2.5 text-11 font-bold transition-all ${
        copied
          ? 'bg-primary text-white'
          : 'bg-primary-soft text-primary hover:bg-primary/20'
      }`}
    >
      {copied ? (
        <>
          <CheckIcon className="size-3.5 stroke-[3]" />
          <span>Tersalin</span>
        </>
      ) : (
        <>
          <CopyIcon className="size-3.5" />
          <span>Salin</span>
        </>
      )}
    </button>
  )
}

/**
 * Langkah 3: Pilih Pembayaran (Sesuai persis dengan design/langkah-3-pilih-pembayaran.svg)
 */
export default function StepPembayaran({ flow }) {
  const {
    method, amount, uniqueCode, total, transactionNo,
    setMethod, goNext, goBack,
    createError, retryCreate, isCreating, isDemoMode,
  } = flow

  // Tab aktif: 'qr' atau 'bank'
  const isBankMethod = method === 'bca' || method === 'seabank'
  const [activeTab, setActiveTab] = useState(isBankMethod ? 'bank' : 'qr')
  const [selectedBank, setSelectedBank] = useState(
    method === 'seabank' ? 'seabank' : 'bca',
  )

  // Pastikan metode awal selalu terisi jika belum diset
  useEffect(() => {
    if (!method) {
      setMethod('qris')
    }
  }, [method, setMethod])

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab === 'qr') {
      setMethod('qris')
    } else {
      setMethod(selectedBank)
    }
  }

  function handleBankChange(bankId) {
    setSelectedBank(bankId)
    setMethod(bankId)
  }

  const currentPayment = getPaymentMethod(method || (activeTab === 'qr' ? 'qris' : selectedBank))

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        goNext()
      }}
      className="flex flex-col gap-5"
    >
      {/* 1. AMOUNT BANNER (design/langkah-3-pilih-pembayaran.svg) */}
      <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4 text-center">
        <p className="text-12 font-semibold text-muted">Total yang harus dibayar</p>
        <p className="mt-1 text-26 font-black tracking-tight text-primary md:text-28">
          {formatRupiah(total)}
        </p>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-12 text-muted">
          <span>Nominal {formatRupiah(amount)}</span>
          <span>+</span>
          <span className="inline-flex items-center gap-1 rounded bg-accent/20 px-1.5 py-0.5 text-11 font-extrabold text-ink">
            Kode unik:{' '}
            {isCreating ? (
              <span className="animate-pulse">menyiapkan…</span>
            ) : uniqueCode ? (
              uniqueCode
            ) : isDemoMode ? (
              '000'
            ) : (
              '—'
            )}
          </span>
        </div>
      </div>

      {/* ERROR saat membuat donasi di server (hanya jika bukan demo) */}
      {createError && (
        <div
          role="alert"
          className="flex flex-col gap-2.5 rounded-xl border border-danger/30 bg-danger-soft p-3.5 text-12 text-danger"
        >
          <p className="font-semibold leading-relaxed">{createError}</p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => retryCreate()}
            className="self-start"
          >
            Coba Buat Lagi
          </Button>
        </div>
      )}

      {/* 2. METHOD TABS (Tab/QR vs Tab/Transfer) */}
      <div
        role="tablist"
        aria-label="Pilihan tipe pembayaran"
        className="grid grid-cols-2 gap-2 rounded-xl bg-surface p-1 border border-line"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'qr'}
          onClick={() => handleTabChange('qr')}
          className={`flex h-11 items-center justify-center gap-2 rounded-lg text-13 font-bold transition-all ${
            activeTab === 'qr'
              ? 'bg-primary text-white shadow-xs'
              : 'text-muted hover:text-ink'
          }`}
        >
          <QrCodeIcon className="size-4" />
          <span>QR Code</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'bank'}
          onClick={() => handleTabChange('bank')}
          className={`flex h-11 items-center justify-center gap-2 rounded-lg text-13 font-bold transition-all ${
            activeTab === 'bank'
              ? 'bg-primary text-white shadow-xs'
              : 'text-muted hover:text-ink'
          }`}
        >
          <CreditCardIcon className="size-4" />
          <span>Transfer Bank</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'qr' ? (
        /* QR Code Section */
        <div className="flex flex-col items-center rounded-2xl border border-line bg-white p-5 text-center shadow-xs">
          <div className="flex size-[200px] items-center justify-center rounded-2xl border border-line bg-white p-2 shadow-xs">
            <QRCodeSVG
              value={currentPayment.qrValue || 'https://kasihbersama.id/qris-donasi'}
              size={176}
              level="M"
              marginSize={0}
              fgColor={QR_FOREGROUND}
              bgColor={QR_BACKGROUND}
              title="QRIS Donasi KasihBersama"
            />
          </div>

          <p className="mt-4 text-13 font-bold text-ink">
            Scan QR code di atas menggunakan aplikasi bank atau e-wallet Anda
          </p>
          <p className="mt-1 text-11 text-muted">
            Mendukung: BCA · Mandiri · BRI · BNI · GoPay · OVO · DANA · ShopeePay
          </p>
        </div>
      ) : (
        /* Transfer Bank Section */
        <div className="space-y-3">
          {/* Bank Selector pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBankChange('bca')}
              className={`flex-1 rounded-xl border p-2.5 text-center text-12 font-bold transition-all ${
                selectedBank === 'bca'
                  ? 'border-primary bg-primary-soft text-primary shadow-xs'
                  : 'border-line bg-white text-muted hover:text-ink'
              }`}
            >
              Transfer BCA
            </button>
            <button
              type="button"
              onClick={() => handleBankChange('seabank')}
              className={`flex-1 rounded-xl border p-2.5 text-center text-12 font-bold transition-all ${
                selectedBank === 'seabank'
                  ? 'border-primary bg-primary-soft text-primary shadow-xs'
                  : 'border-line bg-white text-muted hover:text-ink'
              }`}
            >
              Transfer SeaBank
            </button>
          </div>

          {/* Account Detail Card (Account Card) */}
          <div className="rounded-2xl border border-line bg-white p-4 shadow-xs divide-y divide-line/60">
            {/* Row 1: Nomor Rekening */}
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="text-11 font-medium text-muted">Nomor Rekening</p>
                <p className="mt-0.5 text-16 font-extrabold font-mono text-ink">
                  {currentPayment.accountNumber}
                </p>
              </div>
              <CopyBadgeButton
                text={currentPayment.accountNumber}
                ariaLabel="Salin nomor rekening"
              />
            </div>

            {/* Row 2: Atas Nama */}
            <div className="py-3">
              <p className="text-11 font-medium text-muted">Atas Nama</p>
              <p className="mt-0.5 text-14 font-bold text-ink">
                {currentPayment.accountName}
              </p>
            </div>

            {/* Row 3: Jumlah Transfer (wajib tepat) */}
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-11 font-bold text-warning-ink">
                  Jumlah Transfer (wajib tepat)
                </p>
                <p className="mt-0.5 text-17 font-black text-primary">
                  {formatRupiah(total)}
                </p>
              </div>
              <CopyBadgeButton
                text={total}
                ariaLabel="Salin nominal transfer lengkap"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. NOTE (Alert Note) */}
      <div className="flex items-start gap-2.5 rounded-xl border border-warning-line bg-warning-soft p-3 text-12 font-medium text-warning-ink">
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-accent" />
        <p className="leading-relaxed">
          Transfer dengan nominal yang tepat agar donasi Anda dapat segera dikonfirmasi.
        </p>
      </div>

      {/* 5. UPLOAD HINT */}
      <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-[#FDFCF4] p-3 text-12 font-medium text-ink">
        <UploadCloudIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="leading-relaxed">
          Setelah transfer, unggah bukti pembayaran di langkah berikutnya.
        </p>
      </div>

      {/* 6. ACTIONS (Kembali + Sudah Transfer →) */}
      <ActionRow layout="back-primary">
        <Button variant="outline" type="button" onClick={goBack} className="min-w-28">
          Kembali
        </Button>
        <Button type="submit" variant="primary" className="font-bold">
          Sudah Transfer →
        </Button>
      </ActionRow>
    </form>
  )
}
