import { useRef } from 'react'
import { DONATION_RULES, QUICK_AMOUNTS } from '../../config/campaign.js'
import { useFocusFirstInvalid } from '../../hooks/useFocusFirstInvalid.js'
import { formatAmountInput, formatRupiah } from '../../lib/format.js'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'
import Input from '../ui/Input.jsx'
import CampaignSummary from './CampaignSummary.jsx'

/** Langkah 1: pilih nominal cepat atau ketik nominal sendiri. */
export default function StepNominal({ flow }) {
  const formRef = useRef(null)
  const { amount, errors, attemptCount, setAmountText, selectQuickAmount, goNext } = flow
  useFocusFirstInvalid(formRef, attemptCount)

  // Input diformat dengan titik ribuan. Agar kursor tidak melompat ke akhir
  // setiap kali titik ditambahkan, posisinya dihitung ulang dari jumlah digit
  // di sebelah kiri kursor.
  function handleAmountChange(event) {
    const input = event.target
    const caret = input.selectionStart ?? input.value.length
    const digitsBeforeCaret = input.value.slice(0, caret).replace(/\D/g, '').length
    setAmountText(input.value)
    window.requestAnimationFrame(() => {
      if (document.activeElement !== input) return
      let digits = 0
      let position = 0
      while (position < input.value.length && digits < digitsBeforeCaret) {
        if (/\d/.test(input.value[position])) digits += 1
        position += 1
      }
      input.setSelectionRange(position, position)
    })
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        goNext()
      }}
      className="flex flex-col gap-5"
    >
      <CampaignSummary campaign={flow.campaign} />

      <p id="nominal-cepat-label" className="text-13 font-semibold text-ink">
        Pilih nominal cepat
      </p>
      <div
        role="group"
        aria-labelledby="nominal-cepat-label"
        className="grid grid-cols-3 gap-chip-gap max-modal:grid-cols-2"
      >
        {QUICK_AMOUNTS.map((value) => (
          <Chip key={value} selected={amount === value} onClick={() => selectQuickAmount(value)}>
            {formatRupiah(value)}
          </Chip>
        ))}
      </div>

      <Input
        label="Atau masukkan nominal lain"
        labelSuffix={<span className="sr-only"> (dalam rupiah)</span>}
        prefix="Rp"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        value={formatAmountInput(amount)}
        onChange={handleAmountChange}
        hint={`Minimal donasi ${formatRupiah(DONATION_RULES.minAmount)}`}
        error={errors.amount}
        inputClassName="text-20 font-bold"
      />

      <Button type="submit">Lanjutkan</Button>
    </form>
  )
}
