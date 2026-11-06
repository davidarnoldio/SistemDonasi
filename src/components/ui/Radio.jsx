import { useId } from 'react'
import { cx } from '../../lib/cx.js'
import LogoBadge from './LogoBadge.jsx'

/** Grup pilihan radio dengan judul kecil di atasnya dan pesan error di bawahnya. */
export function RadioGroup({ label, error, className, children }) {
  const labelId = useId()
  const errorId = useId()
  return (
    <div className={cx('flex flex-col gap-3', className)}>
      <p id={labelId} className="text-12 font-semibold text-muted">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="flex flex-col gap-chip-gap"
      >
        {children}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-12 text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Kartu opsi dengan radio. Tinggi 52px; kartu terpilih memakai border 2px hijau
 * dan latar hijau muda. Padding disesuaikan agar isi tidak bergeser 1px.
 */
export function RadioCard({ logo, label, checked, ...rest }) {
  return (
    <label
      className={cx(
        'flex h-control items-center gap-3 rounded-lg transition-colors',
        checked
          ? 'border-2 border-primary bg-primary-soft px-3'
          : 'border border-line bg-white px-[13px] hover:bg-surface',
      )}
    >
      <LogoBadge>{logo}</LogoBadge>
      <span className="flex-1 text-14 font-semibold text-ink">{label}</span>
      <span className="relative size-5 shrink-0">
        <input
          type="radio"
          checked={checked}
          className="peer absolute inset-0 m-0 size-full appearance-none rounded-full border-2 border-muted bg-white checked:border-primary"
          {...rest}
        />
        <span className="pointer-events-none absolute inset-[5px] hidden rounded-full bg-primary peer-checked:block" />
      </span>
    </label>
  )
}
