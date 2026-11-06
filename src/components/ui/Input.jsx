import { useId } from 'react'
import { cx } from '../../lib/cx.js'

/**
 * Bingkai untuk Input dan Textarea: border 1px, radius 12px. Saat fokus, garis
 * menjadi 2px hijau (border 1px + lapisan 1px di dalam). Lapisan itu digambar di
 * atas prefix agar garis fokus tidak terpotong.
 */
export function FieldFrame({ invalid = false, className, children }) {
  return (
    <div
      className={cx(
        'relative flex overflow-hidden rounded-lg border bg-white',
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[11px] after:border after:border-transparent after:content-['']",
        invalid
          ? 'border-danger focus-within:after:border-danger'
          : 'border-line focus-within:border-primary focus-within:after:border-primary',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Teks bantu / pesan error di bawah kolom. Error memakai role="alert". */
export function FieldMessage({ id, error, hint }) {
  if (error) {
    return (
      <p id={id} role="alert" className="text-12 text-danger">
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={id} className="text-12 text-muted">
        {hint}
      </p>
    )
  }
  return null
}

/**
 * Input teks dengan label, prefix opsional (mis. "Rp"), teks bantu, dan pesan error.
 * Jarak antar bagian 20px mengikuti tumpukan form di Figma.
 */
export default function Input({
  id,
  label,
  labelSuffix,
  hint,
  error,
  prefix,
  className,
  inputClassName,
  ...rest
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const messageId = `${inputId}-message`

  return (
    <div className={cx('flex flex-col gap-5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-13 font-semibold text-ink">
          {label}
          {labelSuffix}
        </label>
      )}
      <FieldFrame invalid={Boolean(error)} className="h-control">
        {prefix && (
          <span
            aria-hidden="true"
            className="flex w-[55px] shrink-0 items-center justify-center bg-surface text-16 font-bold text-muted"
          >
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cx(
            'min-w-0 flex-1 bg-transparent px-4 text-14 font-medium text-ink placeholder:font-normal placeholder:text-muted',
            inputClassName,
          )}
          {...rest}
        />
      </FieldFrame>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  )
}
