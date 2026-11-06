import { cx } from '../../lib/cx.js'
import { Spinner } from './icons.jsx'

// Tinggi 52px (md) dan 35px (sm) mengikuti Figma. Tombol nonaktif memakai opacity 40%.
const sizes = {
  md: 'h-control px-6 text-16',
  sm: 'h-[35px] px-5 text-13',
}

const variants = {
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-ink font-bold',
  outline: 'border border-primary bg-white text-primary',
  secondary: 'border border-line bg-white text-ink hover:bg-surface',
  danger: 'bg-danger text-white',
}

const hovers = {
  primary: 'hover:brightness-95 active:brightness-90',
  accent: 'hover:brightness-95 active:brightness-90',
  outline: 'hover:bg-primary-soft active:bg-primary-soft',
  secondary: 'hover:bg-surface active:bg-line',
  danger: 'hover:brightness-95 active:brightness-90',
}

/**
 * Tombol primary / outline. `as` memungkinkan dipakai sebagai link,
 * mis. <Button as={Link} to="/donatur" variant="outline">.
 * `loading` menampilkan spinner, menonaktifkan klik, dan tetap terlihat aktif.
 */
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...rest
}) {
  const inactive = disabled || loading
  const isNativeButton = Component === 'button'

  return (
    <Component
      {...(isNativeButton
        ? { type: 'button', disabled: inactive }
        : { 'aria-disabled': inactive || undefined })}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex select-none items-center justify-center gap-2 rounded-lg font-semibold transition-[filter,background-color,opacity]',
        sizes[size],
        variants[variant],
        inactive ? (loading ? 'cursor-progress' : 'cursor-not-allowed opacity-40') : hovers[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner className="size-5 shrink-0 animate-spin" />}
      {children}
    </Component>
  )
}
