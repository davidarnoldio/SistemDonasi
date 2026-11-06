import { cx } from '../../lib/cx.js'

// equal        : dua tombol sama lebar (Langkah 2 dan 3, 207 + 205px di Figma).
//                Di layar < 520px tombol kiri mengecil agar label tombol kanan
//                (mis. "Bayar Rp 1.234.567") tetap muat.
// back-primary : tombol Kembali ringkas, tombol utama melebar (Langkah 4).
const layouts = {
  equal: 'grid-cols-2 max-modal:grid-cols-[auto_1fr]',
  'back-primary': 'grid-cols-[auto_1fr]',
}

export default function ActionRow({ layout = 'equal', className, children }) {
  return <div className={cx('grid gap-3', layouts[layout], className)}>{children}</div>
}
