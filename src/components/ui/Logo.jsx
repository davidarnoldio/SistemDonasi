import logoMark from '../../assets/logo-mark.png'
import { cx } from '../../lib/cx.js'

/** Logo KasihBersama: gambar logo dari Figma + wordmark teks dua warna. */
export default function Logo({ className }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <img src={logoMark} alt="" width="40" height="40" className="size-10" />
      <span className="text-24 font-extrabold leading-none">
        <span className="text-logo-green">Kasih</span>
        <span className="text-logo-ink">Bersama</span>
      </span>
    </span>
  )
}
