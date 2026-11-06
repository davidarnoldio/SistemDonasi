import { useId } from 'react'
import { cx } from '../../lib/cx.js'
import { FieldFrame } from './Input.jsx'

/** Textarea setinggi 130px dengan counter "n / maks" di kanan bawah. */
export default function Textarea({ id, label, error, maxLength, value, className, ...rest }) {
  const autoId = useId()
  const textareaId = id ?? autoId
  const counterId = `${textareaId}-counter`
  const errorId = `${textareaId}-error`

  return (
    <div className={cx('flex flex-col gap-5', className)}>
      {label && (
        <label htmlFor={textareaId} className="text-13 font-semibold text-ink">
          {label}
        </label>
      )}
      <FieldFrame invalid={Boolean(error)} className="h-textarea">
        <textarea
          id={textareaId}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(maxLength && counterId, error && errorId) || undefined}
          className="size-full resize-none bg-transparent px-4 py-[17px] text-14 text-ink placeholder:text-muted"
          {...rest}
        />
      </FieldFrame>
      <div className="flex items-start justify-between gap-3">
        {error ? (
          <p id={errorId} role="alert" className="text-12 text-danger">
            {error}
          </p>
        ) : (
          <span />
        )}
        {maxLength ? (
          <p id={counterId} className="text-12 text-muted">
            {value.length} / {maxLength}
          </p>
        ) : null}
      </div>
    </div>
  )
}
