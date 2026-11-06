import { cx } from '../../lib/cx.js'

/** Empat segmen setinggi 4px. Segmen sampai langkah aktif terisi hijau. */
export default function ProgressSteps({ step, total = 4, className }) {
  return (
    <div
      role="progressbar"
      aria-label="Kemajuan donasi"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-valuetext={`Langkah ${step} dari ${total}`}
      className={cx('flex gap-progress-gap', className)}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cx('h-progress flex-1 rounded-full', index < step ? 'bg-primary' : 'bg-line')}
        />
      ))}
    </div>
  )
}
