import { campaigns as defaultCampaigns } from '../config/campaign.js'

const MASTER_CAMPAIGNS_KEY = 'kasihbersama_campaigns_master'
const CUSTOM_CAMPAIGNS_KEY = 'kasihbersama_custom_campaigns'

/**
 * Pemetaan ilustrasi otomatis berdasarkan kategori kampanye.
 */
export function getIllustrationForCategory(category) {
  if (category === 'Medis & Kesehatan') return '/illustrations/medis.svg'
  if (category === 'Bencana Alam') return '/illustrations/bencana.svg'
  if (category === 'Panti Asuhan') return '/illustrations/panti.svg'
  if (category === 'Pendidikan') return '/illustrations/pendidikan.svg'
  if (category === 'Rumah Ibadah') return '/illustrations/mushola.svg'
  return '/illustrations/hero.svg'
}

/**
 * Mengambil daftar mentah seluruh kampanye dari localStorage.
 * Jika belum ada, diinisialisasi dari defaultCampaigns.
 */
export function getRawCampaigns() {
  try {
    const raw = localStorage.getItem(MASTER_CAMPAIGNS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length >= 0) {
        return parsed
      }
    }

    // Inisialisasi awal dengan menggabungkan custom lama jika ada
    let legacyCustom = []
    try {
      const legacy = localStorage.getItem(CUSTOM_CAMPAIGNS_KEY)
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy)
        if (Array.isArray(parsedLegacy)) legacyCustom = parsedLegacy
      }
    } catch {
      legacyCustom = []
    }

    const initial = [...legacyCustom, ...defaultCampaigns]
    localStorage.setItem(MASTER_CAMPAIGNS_KEY, JSON.stringify(initial))
    return initial
  } catch {
    return defaultCampaigns
  }
}

/**
 * Menyimpan seluruh daftar kampanye ke localStorage dan memancarkan event pembaruan.
 */
export function saveRawCampaigns(list) {
  try {
    localStorage.setItem(MASTER_CAMPAIGNS_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event('kasihbersama_campaigns_updated'))
  } catch (err) {
    console.warn('Gagal menyimpan kampanye:', err)
  }
}

/**
 * Kompatibilitas mundur: mengambil daftar kampanye kustom.
 */
export function getCustomCampaigns() {
  const all = getRawCampaigns()
  return all.filter((c) => String(c.id).startsWith('camp-'))
}

/**
 * Menambahkan kampanye baru oleh admin.
 */
export function addCustomCampaign(newCampaign) {
  const current = getRawCampaigns()
  const image = newCampaign.image || getIllustrationForCategory(newCampaign.category)

  const fullCampaign = {
    id: `camp-${Date.now()}`,
    slug: newCampaign.slug || `kampanye-${Date.now()}`,
    title: newCampaign.title,
    category: newCampaign.category || 'Lainnya',
    organizer: newCampaign.organizer || 'Inisiator Kebaikan',
    contact: newCampaign.contact || '',
    target: Number(newCampaign.target) || 10000000,
    raised: 0,
    percentage: 0,
    daysLeft: Number(newCampaign.duration) || 30,
    donorCount: 0,
    image,
    heroImage: image,
    isFeatured: false,
    verified: true,
    description: newCampaign.description || 'Penggalangan dana untuk sesama yang membutuhkan.',
    story: newCampaign.story || newCampaign.description || '',
    beneficiary: newCampaign.beneficiary || newCampaign.organizer || '',
    created_at: new Date().toISOString(),
  }

  const updated = [fullCampaign, ...current]
  saveRawCampaigns(updated)
  return fullCampaign
}

/**
 * Menghapus kampanye berdasarkan ID atau Slug.
 */
export function deleteCampaign(idOrSlug) {
  const current = getRawCampaigns()
  const updated = current.filter(
    (c) => String(c.id) !== String(idOrSlug) && String(c.slug) !== String(idOrSlug),
  )
  saveRawCampaigns(updated)
  return updated
}

/**
 * Mengembalikan daftar kampanye ke 6 kampanye awal (default Figma).
 */
export function resetCampaignsToDefault() {
  saveRawCampaigns(defaultCampaigns)
  return defaultCampaigns
}

/**
 * Mengambil semua kampanye dan menghitung progres donasi (raised, percentage, donorCount)
 * secara dinamis dari donasi nyata yang berstatus 'verified'.
 */
export function getAllCampaigns() {
  const all = getRawCampaigns()

  let verifiedDonations = []
  try {
    const raw = localStorage.getItem('kasihbersama_donations_live')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        verifiedDonations = parsed.filter((d) => d && d.status === 'verified')
      }
    }
  } catch {
    verifiedDonations = []
  }

  return all.map((camp) => {
    const campDonations = verifiedDonations.filter(
      (d) =>
        d.campaign_slug === camp.slug ||
        d.campaignSlug === camp.slug ||
        (d.campaign_title && d.campaign_title === camp.title),
    )
    const raised = campDonations.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0)
    const percentage =
      camp.target > 0 ? Math.min(100, Math.round((raised / camp.target) * 100)) : 0
    const donorCount = campDonations.length

    return {
      ...camp,
      raised,
      percentage,
      donorCount,
    }
  })
}
