import { useCallback, useMemo, useRef, useState } from 'react'
import { campaign as defaultCampaign } from '../config/campaign.js'
import { createDonation, DonationError, submitProof } from '../lib/donations.js'
import { parseAmountInput } from '../lib/format.js'
import { addSimulatedDonation } from '../lib/simulationStore.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { validateProofFile, validateStep } from '../lib/validation.js'

/** Nama yang tampil publik jika donatur menyembunyikan namanya. */
export const HIDDEN_NAME = 'Hamba Allah'

const DEMO_DELAY_MS = 900
const MAX_CREATE_ATTEMPTS = 3

const initialState = {
  step: 1, // 1 sampai 4
  subStep4: 'instruksi', // 'instruksi' | 'ringkasan'
  amount: 0,
  name: '',
  hideName: false,
  message: '',
  method: null, // 'qris' | 'bca' | 'seabank'
  uniqueCode: null, // 100 sampai 999, dibuat SERVER saat masuk Langkah 3 lalu dikunci
  transactionNo: null, // KB-YYYYMMDD-XXXXXX dari server
  proofFile: null,
  proofDataUrl: null,
  status: 'idle', // 'idle' | 'submitting' | 'submitted'
  createError: null, // error saat membuat donasi di Langkah 3
}

/**
 * State dan aturan alur donasi 4 langkah.
 *
 * Perubahan arsitektur: baris donasi 'pending' dibuat di SERVER (Edge Function
 * create-donation) saat donatur masuk Langkah 3. No. transaksi dan kode unik
 * di-generate server-side dan tidak bisa dipilih client. Langkah 4 hanya
 * mengunggah bukti via Edge Function submit-donation (idempotent per
 * transaction_no).
 */
export function useDonationFlow(initialCampaign = defaultCampaign) {
  const [activeCampaign, setActiveCampaign] = useState(initialCampaign)
  const [state, setState] = useState(initialState)
  const [attempted, setAttempted] = useState({}) // langkah yang sudah dicoba "Lanjutkan"
  const [attemptCount, setAttemptCount] = useState(0)
  const [proofError, setProofError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [savedRemotely, setSavedRemotely] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showFailedModal, setShowFailedModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const submittingRef = useRef(false)
  const proofRequestRef = useRef(0)

  const update = useCallback((patch) => setState((prev) => ({ ...prev, ...patch })), [])

  const errors = useMemo(
    () => (attempted[state.step] ? validateStep(state.step, state) : {}),
    [attempted, state],
  )

  const total = state.amount + (state.uniqueCode ?? 0)

  const setAmountText = useCallback((text) => update({ amount: parseAmountInput(text) }), [update])
  const selectQuickAmount = useCallback((value) => update({ amount: value }), [update])
  const setName = useCallback((name) => update({ name }), [update])
  const setHideName = useCallback((hideName) => update({ hideName }), [update])
  const setMessage = useCallback((message) => update({ message }), [update])
  const setMethod = useCallback((method) => update({ method }), [update])

  const selectCampaign = useCallback((camp) => {
    setActiveCampaign(camp)
  }, [])

  const selectProof = useCallback(
    async (file) => {
      if (!file) return
      const requestId = ++proofRequestRef.current
      setSubmitError(null)
      setShowFailedModal(false)
      const error = await validateProofFile(file)
      if (requestId !== proofRequestRef.current) return
      if (error) {
        setProofError(error)
        update({ proofFile: null, proofDataUrl: null })
        return
      }
      setProofError(null)

      // Buat data URL untuk pratinjau lokal
      const reader = new FileReader()
      reader.onload = (e) => {
        update({ proofFile: file, proofDataUrl: e.target.result })
      }
      reader.readAsDataURL(file)
    },
    [update],
  )

  const clearProof = useCallback(() => {
    proofRequestRef.current += 1
    setProofError(null)
    setSubmitError(null)
    setShowFailedModal(false)
    update({ proofFile: null, proofDataUrl: null })
  }, [update])

  /**
   * Membuat donasi 'pending' di server (dipanggil saat validasi Langkah 3 lolos).
   * Retry dengan backoff untuk kegagalan transient (network/5xx).
   */
  const createOnServer = useCallback(
    async (method) => {
      if (isCreating) return false
      setIsCreating(true)
      update({ createError: null })
      try {
        let lastError = null
        for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
          try {
            const result = await createDonation({
              campaignSlug: activeCampaign?.slug || 'donasi-umum',
              donorName: state.name.trim() || HIDDEN_NAME,
              hideName: state.hideName,
              amount: state.amount,
              method,
              message: state.message.trim() || null,
            })
            update({
              uniqueCode: result.unique_code,
              transactionNo: result.transaction_no,
            })
            return true
          } catch (error) {
            lastError = error
            // Hanya retry untuk kegagalan transient, bukan validasi (4xx).
            const transient =
              error instanceof DonationError &&
              (error.code === 'NETWORK' || String(error.code).startsWith('HTTP_5'))
            if (!transient) break
            await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
          }
        }
        update({ createError: lastError?.message ?? 'Donasi gagal dibuat. Coba lagi.' })
        return false
      } finally {
        setIsCreating(false)
      }
    },
    [activeCampaign, state.amount, state.hideName, state.message, state.name, update],
  )

  /** Pindah ke langkah berikutnya jika isian langkah ini valid. */
  const goNext = useCallback(() => {
    if (state.step >= 4) return false
    const stepErrors = validateStep(state.step, state)
    if (Object.keys(stepErrors).length > 0) {
      setAttempted((prev) => ({ ...prev, [state.step]: true }))
      setAttemptCount((count) => count + 1)
      return false
    }

    // Langkah 3: buat donasi di server dulu; kode unik & no. transaksi
    // di-generate server-side dan dikunci untuk langkah berikutnya.
    if (state.step === 3 && isSupabaseConfigured) {
      if (state.uniqueCode === null) {
        createOnServer(state.method) // async; state diisi saat selesai
        return false // tetap di Langkah 3 sampai server merespons
      }
    }

    const patch = { step: state.step + 1 }
    if (patch.step === 4) patch.subStep4 = 'instruksi'
    setSubmitError(null)
    setShowFailedModal(false)
    update(patch)
    return true
  }, [createOnServer, state, update])

  /** Kembali satu langkah. Semua isian dipertahankan. */
  const goBack = useCallback(() => {
    if (state.step <= 1 || state.status !== 'idle') return
    setSubmitError(null)
    setShowFailedModal(false)
    update({ step: state.step - 1 })
  }, [state.step, state.status, update])

  const reset = useCallback(() => {
    proofRequestRef.current += 1
    submittingRef.current = false
    setState(initialState)
    setAttempted({})
    setAttemptCount(0)
    setProofError(null)
    setSubmitError(null)
    setSavedRemotely(false)
    setShowConfirmModal(false)
    setShowFailedModal(false)
  }, [])

  /** Coba lagi membuat donasi di server (dipakai bila createError muncul). */
  const retryCreate = useCallback(() => {
    update({ createError: null })
    return createOnServer(state.method)
  }, [createOnServer, state.method, update])

  /** Kirim bukti pembayaran. Idempotent: nama file = transaction_no di server. */
  const submit = useCallback(async () => {
    if (submittingRef.current || state.status === 'submitted') return
    const file = state.proofFile
    const fileError = await validateProofFile(file)
    if (fileError) {
      setProofError(fileError)
      return
    }

    submittingRef.current = true
    setSubmitError(null)
    setShowFailedModal(false)
    update({ status: 'submitting' })

    try {
      if (isSupabaseConfigured) {
        await submitProof({ transactionNo: state.transactionNo, file })
        setSavedRemotely(true)
        update({ status: 'submitted', subStep4: 'ringkasan' })
      } else {
        // Mode demo lokal: simpan juga ke local simulated store agar admin bisa melihatnya!
        await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY_MS))
        addSimulatedDonation({
          id: `sim-${Date.now()}`,
          transaction_no: state.transactionNo,
          campaign_slug: activeCampaign?.slug || 'donasi-umum',
          campaign_title: activeCampaign?.title || 'Donasi KasihBersama',
          donor_name: state.name.trim() || HIDDEN_NAME,
          hide_name: state.hideName,
          amount: state.amount,
          unique_code: state.uniqueCode,
          method: state.method,
          message: state.message.trim() || null,
          proof_path: null,
          proof_data_url: state.proofDataUrl,
          proof_filename: file?.name || 'bukti_transfer.jpg',
          status: 'pending',
          rejection_reason: null,
          created_at: new Date().toISOString(),
        })
        setSavedRemotely(false)
        update({ status: 'submitted', subStep4: 'ringkasan' })
      }
    } catch (error) {
      const msg = error instanceof DonationError ? error.message : 'Terjadi kesalahan saat mengirim. Coba lagi.'
      setSubmitError(msg)
      setShowFailedModal(true)
      update({ status: 'idle' })
    } finally {
      submittingRef.current = false
    }
  }, [activeCampaign, state, update])

  return {
    ...state,
    campaign: activeCampaign,
    total,
    errors,
    attemptCount,
    proofError,
    submitError,
    savedRemotely,
    showConfirmModal,
    showFailedModal,
    isSubmitting: state.status === 'submitting',
    isSubmitted: state.status === 'submitted',
    isDemoMode: !isSupabaseConfigured,
    isCreating,
    // Aksi
    selectCampaign,
    setAmountText,
    selectQuickAmount,
    setName,
    setHideName,
    setMessage,
    setMethod,
    selectProof,
    clearProof,
    goNext,
    goBack,
    submit,
    reset,
    retryCreate,
    setShowConfirmModal,
    setShowFailedModal,
  }
}
