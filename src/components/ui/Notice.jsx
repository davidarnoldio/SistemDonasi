import { cx } from '../../lib/cx.js'
import { AlertCircleIcon, InfoIcon } from './icons.jsx'

// info    : kotak hijau muda dengan ikon info (catatan verifikasi di Figma)
// warning : kotak kuning dengan ikon peringatan (catatan transfer di Figma)
// danger  : kotak merah muda untuk error yang harus segera dibaca
// neutral : kotak lembut netral dengan ikon info
const tones = {
  info: {
    box: 'gap-2 rounded-lg bg-primary-soft px-3.5 py-3 text-12 font-semibold leading-[19px] text-primary',
    Icon: InfoIcon,
    icon: 'size-[18px] text-primary',
  },
  warning: {
    box: 'gap-2 rounded-md border border-warning-line bg-warning-soft px-2.5 py-2 text-12 font-medium text-warning-ink',
    Icon: AlertCircleIcon,
    icon: 'mt-px size-3.5 text-accent',
  },
  danger: {
    box: 'gap-2 rounded-lg border border-danger bg-danger-soft px-3 py-2.5 text-13 font-semibold text-danger',
    Icon: AlertCircleIcon,
    icon: 'mt-0.5 size-3.5 text-danger',
  },
  neutral: {
    box: 'gap-2 rounded-xl border border-line/80 bg-white px-3.5 py-3 text-12 font-medium leading-[19px] text-ink shadow-xs',
    Icon: InfoIcon,
    icon: 'size-[18px] text-primary',
  },
}

export default function Notice({ tone = 'info', className, children, ...rest }) {
  const currentTone = tones[tone] || tones.info
  const { box, Icon, icon } = currentTone
  return (
    <div className={cx('flex items-start', box, className)} {...rest}>
      <Icon className={cx('shrink-0', icon)} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
