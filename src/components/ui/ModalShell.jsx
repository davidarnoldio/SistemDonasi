import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ProgressSteps from './ProgressSteps.jsx'
import { XIcon } from './icons.jsx'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]',
].join(',')

/** Elemen yang bisa difokus lewat Tab (tabindex -1 dan elemen tersembunyi dilewati). */
function getTabbable(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (element) => element.tabIndex >= 0 && element.getClientRects().length > 0,
  )
}

/**
 * Kerangka modal donasi: overlay, header (label langkah, judul, tombol close),
 * progress 4 segmen, dan badan yang bisa di-scroll.
 *
 * Perilaku:
 * - role="dialog" aria-modal="true" dengan aria-label
 * - ditutup dengan tombol X dan tombol Esc (bukan klik overlay, supaya isian tidak hilang tak sengaja)
 * - fokus terkunci di dalam modal; fokus dikembalikan ke tombol pemicu saat ditutup
 * - scroll halaman di belakang dikunci
 * - lebar 480px; di bawah 520px memenuhi layar dengan margin 16px
 */
export default function ModalShell({
  open,
  onClose,
  closeDisabled = false,
  step,
  totalSteps = 4,
  stepAddon = null,
  title,
  ariaLabel = 'Formulir donasi',
  children,
}) {
  const panelRef = useRef(null)
  const titleRef = useRef(null)
  const bodyRef = useRef(null)
  const latest = useRef({ onClose, closeDisabled })

  useEffect(() => {
    latest.current = { onClose, closeDisabled }
  })

  // Kunci scroll halaman dan ingat elemen yang fokus sebelum modal terbuka.
  useEffect(() => {
    if (!open) return undefined
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [open])

  // Esc menutup modal; Tab berputar di dalam modal; fokus tidak boleh keluar.
  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (!latest.current.closeDisabled) {
          event.preventDefault()
          latest.current.onClose()
        }
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const items = getTabbable(panelRef.current)
      if (items.length === 0) {
        event.preventDefault()
        titleRef.current?.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const inside = panelRef.current.contains(active)

      if (event.shiftKey) {
        if (!inside || active === first || active === titleRef.current) {
          event.preventDefault()
          last.focus()
        }
      } else if (!inside || active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    function handleFocusIn(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        titleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [open])

  // Setiap judul berganti (langkah baru): fokus ke judul agar pembaca layar
  // membacakan langkah baru, dan gulir kembali ke atas.
  useEffect(() => {
    if (!open) return
    titleRef.current?.focus()
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [open, title])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-modal-gutter motion-safe:animate-overlay-in">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-busy={closeDisabled || undefined}
        className="flex max-h-full w-full max-w-modal flex-col overflow-hidden rounded-3xl bg-[#FDFCF4] shadow-modal motion-safe:animate-modal-in"
      >
        <div className="shrink-0 px-modal-pad pt-modal-pad">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-12 font-semibold text-primary">
                  Langkah {step} dari {totalSteps}
                </p>
                {stepAddon}
              </div>
              <h2 ref={titleRef} tabIndex={-1} className="text-22 font-extrabold text-ink outline-none">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={closeDisabled}
              aria-label="Tutup"
              className="flex size-close shrink-0 items-center justify-center rounded-full bg-surface text-muted transition-[filter,opacity] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <XIcon className="size-close-icon" />
            </button>
          </div>
          <ProgressSteps step={step} total={totalSteps} className="mt-5" />
        </div>

        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-modal-pad pb-modal-pad pt-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
