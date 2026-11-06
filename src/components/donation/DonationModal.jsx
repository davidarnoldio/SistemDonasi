import ModalShell from '../ui/ModalShell.jsx'
import ConfirmDonationModal from './ConfirmDonationModal.jsx'
import FailedDonationModal from './FailedDonationModal.jsx'
import StepInstruksi from './StepInstruksi.jsx'
import StepNominal from './StepNominal.jsx'
import StepOpsi from './StepOpsi.jsx'
import StepPembayaran from './StepPembayaran.jsx'
import StepRingkasan from './StepRingkasan.jsx'

// Judul tiap tampilan mengikuti desain Figma
const TITLES = {
  1: 'Masukkan Nominal',
  2: 'Opsi Tambahan',
  3: 'Pilih Pembayaran',
  instruksi: 'Upload Bukti Pembayaran',
  ringkasan: 'Invoice & Status Donasi',
}

/**
 * Modal donasi 4 langkah. State hidup di `flow` (useDonationFlow).
 */
export default function DonationModal({ open, onClose, flow }) {
  const view = flow.step === 4 ? flow.subStep4 : flow.step

  function handleClose() {
    if (flow.isSubmitting) return
    if (!flow.isSubmitted) flow.reset()
    onClose()
  }

  function handleConfirmDonation() {
    flow.setShowConfirmModal(false)
    flow.goNext()
  }

  return (
    <>
      <ModalShell
        open={open}
        onClose={handleClose}
        closeDisabled={flow.isSubmitting}
        step={flow.step}
        title={TITLES[view]}
      >
        {view === 1 && <StepNominal flow={flow} />}
        {view === 2 && (
          <StepOpsi
            flow={flow}
            onRequestConfirm={() => flow.setShowConfirmModal(true)}
          />
        )}
        {view === 3 && <StepPembayaran flow={flow} />}
        {view === 'instruksi' && <StepInstruksi flow={flow} />}
        {view === 'ringkasan' && <StepRingkasan flow={flow} onClose={handleClose} />}
      </ModalShell>

      {/* Pop-up Konfirmasi Donasi (design/popup-konfirmasi-donasi.svg) */}
      <ConfirmDonationModal
        open={flow.showConfirmModal}
        onClose={() => flow.setShowConfirmModal(false)}
        onConfirm={handleConfirmDonation}
        flow={flow}
      />

      {/* Pop-up Donasi Tidak Berhasil (design/popup-donasi-tidak-berhasil.svg) */}
      <FailedDonationModal
        open={flow.showFailedModal}
        onClose={() => flow.setShowFailedModal(false)}
        onRetry={() => {
          flow.setShowFailedModal(false)
          flow.submit()
        }}
        message={flow.submitError}
      />
    </>
  )
}
