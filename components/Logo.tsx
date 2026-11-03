export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path
        d="M24 2.5c4.2 0 7.4 2.4 11.2 3.6 3.8 1.2 7.9 1.1 10 4.6 2.1 3.5.3 7.4.3 11.4s2.6 7.6.9 11.4c-1.8 3.8-5.9 4.4-9.5 6.6-3.6 2.2-6.5 5.4-12.9 5.4s-9.3-3.2-12.9-5.4C7.5 37.9 3.4 37.3 1.6 33.5-.1 29.7 2.5 26 2.5 22.1s-1.8-7.9.3-11.4c2.1-3.5 6.2-3.4 10-4.6C16.6 4.9 19.8 2.5 24 2.5Z"
        fill="#FFE500"
        stroke="#12416A"
        strokeWidth="1.6"
      />
      <path d="M15 14h17v4.2H21.6l6.2 5.8-6.2 5.8H32V34H15v-3.6l7.2-6.4L15 17.6Z" fill="#0C74C6" />
      <circle cx="36.5" cy="24" r="2.2" fill="#D9342B" />
      <circle cx="11.5" cy="24" r="2.2" fill="#D9342B" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-[17px] font-extrabold tracking-tight ${light ? "text-white" : "text-ink-900"}`}>
          IKAMAT <span className={light ? "text-sun-400" : "text-sky-600"}>Connect</span>
        </span>
        <span className={`block text-[10.5px] font-medium ${light ? "text-sky-100" : "text-ink-500"}`}>Matematika FMIPA Unpad</span>
      </span>
    </span>
  );
}
