// Ikon inline. Path diambil dari ekspor SVG Figma (folder design/) agar sama persis.
// Semua ikon dekoratif: disembunyikan dari pembaca layar.
const common = { 'aria-hidden': true, focusable: 'false' }
const stroked = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }

/** Tombol close: kotak ikon 16px, goresan 2px. */
export function XIcon(props) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M12 4L4 12M4 4L12 12" />
    </svg>
  )
}

/** Centang di dalam checkbox 22px. */
export function CheckIcon(props) {
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M15.667 7.5L9.25 13.917L6.333 11" />
    </svg>
  )
}

/** Hati di thumbnail kampanye (kotak 14px, isi dan garis putih). */
export function HeartIcon(props) {
  return (
    <svg viewBox="85 168 14 14" width="14" height="14" strokeWidth="2" strokeLinecap="round" {...common} {...props}>
      <path d="M97.1566 170.689C96.8586 170.391 96.5049 170.155 96.1155 169.993C95.7262 169.832 95.3089 169.749 94.8874 169.749C94.466 169.749 94.0486 169.832 93.6593 169.993C93.2699 170.155 92.9162 170.391 92.6182 170.689L91.9999 171.308L91.3816 170.689C90.7798 170.087 89.9635 169.749 89.1124 169.749C88.2613 169.749 87.4451 170.087 86.8432 170.689C86.2414 171.291 85.9033 172.107 85.9033 172.958C85.9033 173.81 86.2414 174.626 86.8432 175.228L87.4616 175.846L91.9999 180.384L96.5382 175.846L97.1566 175.228C97.4547 174.93 97.6911 174.576 97.8524 174.187C98.0138 173.797 98.0968 173.38 98.0968 172.958C98.0968 172.537 98.0138 172.12 97.8524 171.73C97.6911 171.341 97.4547 170.987 97.1566 170.689Z" />
    </svg>
  )
}

export function CopyIcon(props) {
  return (
    <svg viewBox="406 636 14 14" width="14" height="14" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M408.333 645.334C407.691 645.334 407.166 644.809 407.166 644.167V638.333C407.166 637.691 407.691 637.166 408.333 637.166H414.167C414.808 637.166 415.333 637.691 415.333 638.333M411.833 640.667H417.667C418.311 640.667 418.834 641.189 418.834 641.833V647.667C418.834 648.311 418.311 648.834 417.667 648.834H411.833C411.189 648.834 410.666 648.311 410.666 647.667V641.833C410.666 641.189 411.189 640.667 411.833 640.667Z" />
    </svg>
  )
}

export function UploadCloudIcon(props) {
  return (
    <svg viewBox="246 351 36 33" width="36" height="33" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M264.001 369.166V382.5M270.667 375.833L264.001 369.166L257.334 375.833M250.669 372.332C249.43 371.067 248.496 369.536 247.937 367.856C247.378 366.177 247.208 364.392 247.441 362.637C247.674 360.882 248.303 359.203 249.281 357.727C250.258 356.251 251.559 355.017 253.084 354.119C254.609 353.22 256.319 352.68 258.084 352.54C259.848 352.4 261.622 352.664 263.269 353.311C264.917 353.958 266.396 354.971 267.594 356.275C268.792 357.578 269.678 359.137 270.184 360.833H273.167C274.777 360.833 276.343 361.35 277.635 362.309C278.928 363.267 279.878 364.616 280.345 366.156C280.812 367.696 280.771 369.346 280.229 370.861C279.687 372.376 278.672 373.676 277.334 374.57" />
    </svg>
  )
}

export function ImagePlusIcon(props) {
  return (
    <svg viewBox="212.5 456.5 16 16" width="16" height="16" strokeWidth="1.8" {...stroked} {...common} {...props}>
      <path d="M223.167 459.833H227.167M225.167 457.833V461.833M226.5 464.166V469.166C226.5 469.52 226.36 469.859 226.109 470.109C225.859 470.359 225.52 470.499 225.167 470.499H215.833C215.48 470.499 215.141 470.359 214.891 470.109C214.64 469.859 214.5 469.52 214.5 469.166V459.833C214.5 459.479 214.64 459.14 214.891 458.89C215.141 458.64 215.48 458.499 215.833 458.499H220.833M226.5 466.499L224.443 464.442C224.193 464.192 223.854 464.052 223.5 464.052C223.146 464.052 222.807 464.192 222.557 464.442L216.5 470.499M219.833 462.499C219.833 463.236 219.236 463.833 218.5 463.833C217.764 463.833 217.167 463.236 217.167 462.499C217.167 461.763 217.764 461.166 218.5 461.166C219.236 461.166 219.833 461.763 219.833 462.499Z" />
    </svg>
  )
}

export function InfoIcon(props) {
  return (
    <svg viewBox="66 561 18 18" width="18" height="18" strokeWidth="1.8" {...stroked} {...common} {...props}>
      <path d="M75.0001 573V570M75.0001 567H75.0076M82.5007 570C82.5007 574.143 79.1426 577.501 75.0001 577.501C70.8576 577.501 67.4995 574.143 67.4995 570C67.4995 565.858 70.8576 562.5 75.0001 562.5C79.1426 562.5 82.5007 565.858 82.5007 570Z" />
    </svg>
  )
}

export function AlertCircleIcon(props) {
  return (
    <svg viewBox="64 815 14 14" width="14" height="14" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M70.9998 819.667V822M70.9998 824.334H71.0056M76.8336 822C76.8336 825.222 74.2217 827.834 70.9998 827.834C67.7779 827.834 65.166 825.222 65.166 822C65.166 818.778 67.7779 816.166 70.9998 816.166C74.2217 816.166 76.8336 818.778 76.8336 822Z" />
    </svg>
  )
}

export function Spinner(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...common} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** Lingkaran centang besar dengan empat sparkle (Langkah 4 di Figma). */
export function SuccessArt(props) {
  return (
    <svg viewBox="199 136 130 116" width="130" height="116" fill="none" {...common} {...props}>
      <circle cx="264" cy="200" r="48" className="fill-primary" />
      <path
        d="M281.333 187L257.5 210.833L246.667 200"
        className="stroke-white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g className="fill-accent">
        <path d="M218 147L219.945 156.055L229 158L219.945 159.945L218 169L216.055 159.945L207 158L216.055 156.055L218 147Z" />
        <path d="M307 139L308.414 145.586L315 147L308.414 148.414L307 155L305.586 148.414L299 147L305.586 145.586L307 139Z" />
        <path d="M309.5 235L310.649 240.351L316 241.5L310.649 242.649L309.5 248L308.351 242.649L303 241.5L308.351 240.351L309.5 235Z" />
        <path d="M207 227L208.061 231.939L213 233L208.061 234.061L207 239L205.939 234.061L201 233L205.939 231.939L207 227Z" />
      </g>
    </svg>
  )
}

export function PendingArt(props) {
  return (
    <svg viewBox="0 0 130 116" width="130" height="116" fill="none" {...common} {...props}>
      <circle cx="65" cy="58" r="48" fill="#FEF3C7" />
      <circle cx="65" cy="58" r="28" stroke="#D97706" strokeWidth="4" />
      <path d="M65 44v14l10 6" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function CircleCheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function CircleXIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

export function ShieldCheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function ShieldUserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function FileCheck2Icon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m3 15 2 2 4-4" />
    </svg>
  )
}

export function FileSearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <circle cx="10" cy="14" r="3" />
      <path d="m12.2 16.2 2 2" />
    </svg>
  )
}

export function FileImageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <circle cx="10" cy="12" r="2" />
      <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
    </svg>
  )
}

export function HistoryIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

export function LayoutDashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

export function LogOutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}

export function ArrowDownWideNarrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="m3 16 4 4 4-4" />
      <path d="M7 20V4" />
      <path d="M11 4h10" />
      <path d="M11 8h7" />
      <path d="M11 12h4" />
    </svg>
  )
}

export function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

export function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function ChevronLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

export function ShareIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  )
}

export function QrCodeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  )
}

export function CreditCardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

export function Trash2Icon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

export function LayersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

export function RotateCcwIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

export function ListChecksIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  )
}

export function LockKeyholeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <circle cx="12" cy="16" r="1" />
      <rect width="18" height="12" x="3" y="10" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </svg>
  )
}

export function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" strokeWidth="2" {...stroked} {...common} {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
