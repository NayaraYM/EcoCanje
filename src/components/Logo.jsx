export default function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? 'logo-light' : ''}`}>
      <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#f1a20d" />
        <path d="M14 46C14 26 28 14 50 14c0 22-12 34-30 34" fill="#1f4a12" />
        <path d="M16 50C26 38 34 30 44 22" stroke="#f1a20d" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <span>EcoCanje <b>Huancayo</b></span>
    </span>
  )
}
