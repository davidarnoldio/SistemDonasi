import { cx } from '../../lib/cx.js'

// Label sama dengan status di database: pending, verified, rejected.
// "pending" memakai warna kuning dari chip status di halaman admin Figma.
const statuses = {
  pending: { label: 'Menunggu Verifikasi', className: 'bg-warning-soft text-warning-ink' },
  verified: { label: 'Terverifikasi', className: 'bg-primary-soft text-primary' },
  rejected: { label: 'Ditolak', className: 'bg-danger-soft text-danger' },
}

export default function StatusBadge({ status = 'pending', className }) {
  const config = statuses[status] ?? statuses.pending
  return (
    <span
      className={cx(
        'inline-flex h-[23px] items-center whitespace-nowrap rounded-full px-3 text-12 font-bold',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
