import { campaign as defaultCampaign } from '../../config/campaign.js'
import { HeartIcon } from '../ui/icons.jsx'

/** Kartu "Donasi untuk ..." (tinggi minimal 80px, thumbnail 56x56 dengan ikon hati). */
export default function CampaignSummary({ campaign = defaultCampaign }) {
  const current = campaign || defaultCampaign
  return (
    <div className="flex min-h-summary items-center gap-3 rounded-xl border border-line/60 bg-white p-3 shadow-xs">
      <div
        aria-hidden="true"
        className="bg-thumb flex size-thumb shrink-0 items-center justify-center rounded-lg overflow-hidden relative"
      >
        {current.image ? (
          <img src={current.image} alt="" className="size-full object-cover" />
        ) : (
          <HeartIcon className="fill-white stroke-white opacity-40 size-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-11 font-semibold uppercase tracking-wider text-primary">Donasi untuk</p>
        <p className="mt-0.5 text-13 font-bold text-ink line-clamp-2">{current.title}</p>
      </div>
    </div>
  )
}
