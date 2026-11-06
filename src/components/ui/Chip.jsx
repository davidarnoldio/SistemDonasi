import { cx } from '../../lib/cx.js'

/**
 * Chip nominal cepat. Tinggi tetap 49px; chip terpilih memakai border 2px
 * di dalam kotak yang sama sehingga tidak ada layout yang bergeser.
 */
export default function Chip({ selected = false, className, children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'h-[49px] rounded-lg px-2 text-15 transition-colors',
        selected
          ? 'border-2 border-primary bg-primary-soft font-bold text-primary'
          : 'border border-line bg-white font-semibold text-ink hover:bg-surface',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
