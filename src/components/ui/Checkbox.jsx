import { cx } from '../../lib/cx.js'
import { CheckIcon } from './icons.jsx'

/**
 * Baris checkbox abu-abu (tinggi 54px). Seluruh baris adalah <label> sehingga
 * area klik luas. Input asli dipakai agar keyboard dan pembaca layar bekerja.
 */
export default function Checkbox({ className, children, ...rest }) {
  return (
    <label className={cx('flex h-[54px] items-center gap-3 rounded-lg bg-surface px-4', className)}>
      <span className="relative size-checkbox shrink-0">
        <input
          type="checkbox"
          className="peer absolute inset-0 m-0 size-full appearance-none rounded-xs border-2 border-muted bg-white checked:border-primary checked:bg-primary"
          {...rest}
        />
        <CheckIcon className="pointer-events-none absolute inset-0 hidden text-white peer-checked:block" />
      </span>
      <span className="text-14 font-medium text-ink">{children}</span>
    </label>
  )
}
