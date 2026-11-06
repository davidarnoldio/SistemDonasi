import { cx } from '../../lib/cx.js'

/** Kotak logo placeholder 48x28 (bukan logo bank asli). */
export default function LogoBadge({ className, children }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'flex h-logo-h w-logo-w shrink-0 items-center justify-center rounded-xs border border-line bg-white text-10 font-bold text-ink',
        className,
      )}
    >
      {children}
    </span>
  )
}
