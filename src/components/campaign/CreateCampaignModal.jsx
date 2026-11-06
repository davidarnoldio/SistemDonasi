import { useState } from 'react'
import { addCustomCampaign } from '../../lib/campaignStore.js'
import { formatRupiah, parseAmountInput } from '../../lib/format.js'
import Button from '../ui/Button.jsx'
import { AlertCircleIcon, CircleCheckIcon, XIcon } from '../ui/icons.jsx'
import Input from '../ui/Input.jsx'
import Textarea from '../ui/Textarea.jsx'

const CATEGORY_OPTIONS = [
  'Medis & Kesehatan',
  'Bencana Alam',
  'Panti Asuhan',
  'Pendidikan',
  'Rumah Ibadah',
  'Difabel & Lansia',
]

const DURATION_OPTIONS = [
  { label: '14 Hari', value: 14 },
  { label: '30 Hari', value: 30 },
  { label: '60 Hari', value: 60 },
  { label: '90 Hari', value: 90 },
]

export default function CreateCampaignModal({ open, onClose, onCreated }) {
  const [organizer, setOrganizer] = useState('')
  const [contact, setContact] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [title, setTitle] = useState('')
  const [targetInput, setTargetInput] = useState('25.000.000')
  const [duration, setDuration] = useState(30)
  const [beneficiary, setBeneficiary] = useState('')
  const [story, setStory] = useState('')
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdItem, setCreatedItem] = useState(null)

  if (!open) return null

  function resetForm() {
    setOrganizer('')
    setContact('')
    setCategory(CATEGORY_OPTIONS[0])
    setTitle('')
    setTargetInput('25.000.000')
    setDuration(30)
    setBeneficiary('')
    setStory('')
    setErrors({})
    setIsSuccess(false)
    setCreatedItem(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}

    if (!organizer.trim()) {
      errs.organizer = 'Inisiator / lembaga wajib diisi.'
    }
    if (!contact.trim()) {
      errs.contact = 'Nomor WhatsApp / kontak wajib diisi.'
    }
    if (!title.trim()) {
      errs.title = 'Judul kampanye wajib diisi.'
    } else if (title.trim().length < 8) {
      errs.title = 'Judul minimal 8 karakter.'
    }

    const targetNum = parseAmountInput(targetInput)
    if (targetNum < 100000) {
      errs.target = 'Target minimal Rp 100.000.'
    }

    if (!story.trim()) {
      errs.story = 'Kisah kampanye wajib diisi.'
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    let illustration = '/illustrations/hero.svg'
    if (category === 'Medis & Kesehatan') illustration = '/illustrations/medis.svg'
    else if (category === 'Bencana Alam') illustration = '/illustrations/bencana.svg'
    else if (category === 'Panti Asuhan') illustration = '/illustrations/panti.svg'
    else if (category === 'Pendidikan') illustration = '/illustrations/pendidikan.svg'
    else if (category === 'Rumah Ibadah') illustration = '/illustrations/mushola.svg'

    const newCamp = addCustomCampaign({
      title: title.trim(),
      category,
      organizer: organizer.trim(),
      contact: contact.trim(),
      target: targetNum,
      duration,
      beneficiary: beneficiary.trim() || organizer.trim(),
      description: story.trim().slice(0, 160) + (story.trim().length > 160 ? '...' : ''),
      story: story.trim(),
      image: illustration,
      slug: `galang-${Date.now()}`,
    })

    setCreatedItem(newCamp)
    setIsSuccess(true)
    if (onCreated) onCreated(newCamp)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-3 sm:p-4 motion-safe:animate-overlay-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-campaign-title"
        className="flex max-h-[92dvh] w-full max-w-[500px] flex-col overflow-hidden rounded-2xl bg-[#FDFCF4] shadow-modal motion-safe:animate-modal-in"
      >
        {/* Fixed Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line/70 px-5 py-3.5">
          <div>
            <h2 id="create-campaign-title" className="text-17 font-extrabold text-ink sm:text-18">
              Galang Dana Baru
            </h2>
            <p className="text-11 text-muted">
              Atur detail penggalangan dana untuk dipublikasikan di beranda.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup modal"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-ink"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CircleCheckIcon className="size-8" />
            </div>
            <h3 className="mt-3 text-17 font-extrabold text-ink">Kampanye Berhasil Diterbitkan!</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-12 text-muted">
              Kampanye <strong className="text-ink">&ldquo;{createdItem?.title}&rdquo;</strong> kini telah
              aktif dan langsung dapat menerima donasi di KasihBersama.
            </p>

            <div className="mt-5 flex justify-center gap-2">
              <Button size="sm" variant="primary" onClick={handleClose} className="font-bold">
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable Form Body */}
            <form
              id="create-campaign-form"
              noValidate
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
            >
              {/* Nama Inisiator & Kontak */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Nama Inisiator / Lembaga"
                  placeholder="Contoh: Sahabat Peduli"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  error={errors.organizer}
                  required
                />
                <Input
                  label="No. WhatsApp / Kontak"
                  placeholder="Contoh: 081234567890"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  error={errors.contact}
                  required
                />
              </div>

              {/* Kategori & Durasi */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-11 font-bold text-ink">
                    Kategori Kampanye <span className="text-danger">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-line bg-white px-3 text-12 text-ink focus:border-primary focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-11 font-bold text-ink">
                    Durasi Kampanye <span className="text-danger">*</span>
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="h-9.5 w-full rounded-xl border border-line bg-white px-3 text-12 text-ink focus:border-primary focus:outline-none"
                  >
                    {DURATION_OPTIONS.map((dur) => (
                      <option key={dur.value} value={dur.value}>
                        {dur.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Judul Kampanye */}
              <Input
                label="Judul Penggalangan Dana"
                placeholder="Contoh: Bantuan Operasi Jantung Bayi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                required
              />

              {/* Target Dana & Penerima Manfaat */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Target Donasi (Rp)"
                  placeholder="25.000.000"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  error={errors.target}
                  hint={`Target: ${formatRupiah(parseAmountInput(targetInput))}`}
                  required
                />
                <Input
                  label="Penerima Manfaat"
                  placeholder="Contoh: 15 KK Warga Garut"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  hint="Pihak penerima bantuan"
                />
              </div>

              {/* Kisah / Deskripsi Cerita */}
              <Textarea
                label="Kisah & Latar Belakang"
                placeholder="Ceritakan latar belakang, kondisi terkini, dan rencana penyaluran donasi..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                error={errors.story}
                rows={3}
                required
              />

              <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-soft p-2.5 text-11 text-primary font-medium">
                <AlertCircleIcon className="size-3.5 shrink-0 mt-0.5" />
                <p>
                  Kampanye yang diterbitkan akan langsung aktif di beranda dan siap menerima donasi.
                </p>
              </div>
            </form>

            {/* Fixed Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-line/70 bg-white px-5 py-3">
              <Button type="button" size="sm" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button
                type="submit"
                form="create-campaign-form"
                size="sm"
                variant="primary"
                className="font-bold shadow-xs"
              >
                Terbitkan Kampanye
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
