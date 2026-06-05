// Terminal-prompt mark ( >_ ) inside a rounded gradient tile. Ties the brand to
// the `curl | bash` install flow. Scales cleanly from favicon to hero size.
export function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="di-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#di-logo-grad)" />
      {/* chevron > */}
      <path d="M10 11l5 5-5 5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* underscore _ */}
      <path d="M17.5 21H23" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}
