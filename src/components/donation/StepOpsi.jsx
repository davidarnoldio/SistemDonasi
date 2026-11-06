import { useRef } from 'react'
import { DONATION_RULES } from '../../config/campaign.js'
import { HIDDEN_NAME } from '../../hooks/useDonationFlow.js'
import { useFocusFirstInvalid } from '../../hooks/useFocusFirstInvalid.js'
import { validateProfile } from '../../lib/validation.js'
import Button from '../ui/Button.jsx'
import Checkbox from '../ui/Checkbox.jsx'
import Input from '../ui/Input.jsx'
import Textarea from '../ui/Textarea.jsx'
import ActionRow from './ActionRow.jsx'
import CampaignSummary from './CampaignSummary.jsx'

/** Langkah 2: nama (wajib kecuali disembunyikan), sembunyikan nama, doa & dukungan. */
export default function StepOpsi({ flow, onRequestConfirm }) {
  const formRef = useRef(null)
  const {
    name,
    hideName,
    message,
    errors,
    attemptCount,
    setName,
    setHideName,
    setMessage,
    goNext,
    goBack,
  } = flow
  useFocusFirstInvalid(formRef, attemptCount)

  function handleSubmit(event) {
    event.preventDefault()
    const stepErrors = validateProfile({ name, hideName, message })
    if (Object.keys(stepErrors).length > 0) {
      goNext() // memicu validasi dan fokus invalid
      return
    }

    if (onRequestConfirm) {
      onRequestConfirm()
    } else {
      goNext()
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <CampaignSummary campaign={flow.campaign} />

      <Input
        label="Nama lengkap"
        labelSuffix={hideName ? <span className="font-normal text-muted"> (opsional)</span> : null}
        placeholder="Tulis nama lengkap Anda"
        autoComplete="name"
        maxLength={DONATION_RULES.maxNameLength}
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        hint={
          hideName ? `Nama tetap tersimpan, tetapi tampil publik sebagai ${HIDDEN_NAME}.` : undefined
        }
      />

      <Checkbox checked={hideName} onChange={(event) => setHideName(event.target.checked)}>
        Sembunyikan nama saya ({HIDDEN_NAME})
      </Checkbox>

      <Textarea
        label="Doa & dukungan (opsional)"
        placeholder="Tulis doa atau dukungan untuk penerima manfaat..."
        maxLength={DONATION_RULES.maxMessageLength}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        error={errors.message}
      />

      <ActionRow>
        <Button variant="outline" onClick={goBack}>
          Kembali
        </Button>
        <Button type="submit">Lanjutkan</Button>
      </ActionRow>
    </form>
  )
}
