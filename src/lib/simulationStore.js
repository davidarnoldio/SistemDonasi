/**
 * Penyimpanan transaksi lokal untuk sesi aktif tanpa dummy data.
 * Hanya menyimpan transaksi asli yang dilakukan oleh donatur dan diverifikasi oleh admin.
 */

const STORAGE_KEY = 'kasihbersama_donations_live'
const ADMIN_AUTH_KEY = 'kasihbersama_admin_auth'

// Mulai bersih tanpa data transaksi buatan/dummy
export const SEED_DONATIONS = []

export function getStoredDonations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('Error reading from localStorage:', err)
    return []
  }
}

export function saveStoredDonations(donations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations))
    window.dispatchEvent(new Event('kasihbersama_donations_updated'))
  } catch (err) {
    console.warn('Error saving to localStorage:', err)
  }
}

export function addSimulatedDonation(donation) {
  const all = getStoredDonations()
  const updated = [donation, ...all]
  saveStoredDonations(updated)
  return donation
}

export function updateDonationStatus(id, { status, rejection_reason = null }) {
  const all = getStoredDonations()
  const updated = all.map((item) => {
    if (item.id === id || item.transaction_no === id) {
      return {
        ...item,
        status,
        rejection_reason,
        verified_at: new Date().toISOString(),
      }
    }
    return item
  })
  saveStoredDonations(updated)
  return updated
}

/** Admin Auth Helpers */
export function getAdminAuth() {
  try {
    const raw = sessionStorage.getItem(ADMIN_AUTH_KEY) || localStorage.getItem(ADMIN_AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAdminAuth(adminUser, remember = true) {
  const payload = JSON.stringify(adminUser)
  if (remember) {
    localStorage.setItem(ADMIN_AUTH_KEY, payload)
  }
  sessionStorage.setItem(ADMIN_AUTH_KEY, payload)
  window.dispatchEvent(new Event('kasihbersama_auth_changed'))
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_AUTH_KEY)
  sessionStorage.removeItem(ADMIN_AUTH_KEY)
  window.dispatchEvent(new Event('kasihbersama_auth_changed'))
}
