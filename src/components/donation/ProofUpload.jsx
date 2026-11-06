import { useEffect, useRef, useState } from 'react'
import { cx } from '../../lib/cx.js'
import { formatFileSize } from '../../lib/format.js'
import Button from '../ui/Button.jsx'
import { ImagePlusIcon, UploadCloudIcon } from '../ui/icons.jsx'

/**
 * Area unggah bukti transfer sesuai design/langkah-4-upload-bukti.svg
 */
export default function ProofUpload({ file, error, disabled = false, onSelect, onClear }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return undefined
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function openPicker() {
    inputRef.current?.click()
  }

  function handleInputChange(event) {
    const chosen = event.target.files?.[0]
    event.target.value = ''
    if (chosen) onSelect(chosen)
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) onSelect(dropped)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <p id="unggah-label" className="text-13 font-bold text-ink">
          Unggah Bukti Transfer
        </p>
        <p id="unggah-hint" className="mt-1 text-12 text-muted leading-relaxed">
          Pastikan foto bukti transfer terlihat jelas (nama penerima, nomor transaksi, dan nominal).
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="unggah-label"
        aria-describedby={cx('unggah-hint', error && 'unggah-error')}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cx(
          'flex min-h-[210px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all',
          error
            ? 'border-danger bg-danger-soft'
            : dragging
              ? 'border-primary bg-primary-soft'
              : 'border-line bg-surface hover:border-primary/50',
        )}
      >
        {file ? (
          <div className="flex flex-col items-center">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Pratinjau bukti transfer"
                className="max-h-[140px] max-w-full rounded-xl border border-line bg-white object-contain shadow-xs"
              />
            )}
            <p className="mt-3 max-w-xs truncate text-13 font-bold text-ink">{file.name}</p>
            <p className="mt-0.5 text-11 text-muted">{formatFileSize(file.size)}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={openPicker} disabled={disabled}>
                Ganti Gambar
              </Button>
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="h-8 rounded-lg px-3 text-12 font-bold text-danger transition-colors hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <UploadCloudIcon className="size-6 text-primary" />
            </div>
            <p className="mt-3 text-13 font-bold text-ink">
              Tarik & lepas bukti transfer di sini
            </p>
            <p className="my-1.5 text-11 text-muted">atau</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 font-bold shadow-2xs"
              onClick={openPicker}
              disabled={disabled}
            >
              <ImagePlusIcon className="size-4 text-primary" />
              Pilih Gambar
            </Button>
            <p className="mt-3 text-11 text-muted">
              Format: JPG, PNG (Maks. 2MB)
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleInputChange}
      />

      {error && (
        <p id="unggah-error" role="alert" className="text-12 font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
