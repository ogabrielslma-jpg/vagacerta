// Logo DasBank — D estilizado em verde-menta com seta de movimento
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="db-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F4F4A" />
          <stop offset="100%" stopColor="#0B3D3A" />
        </linearGradient>
        <linearGradient id="db-d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00E5B0" />
          <stop offset="100%" stopColor="#00B788" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="56" height="56" rx="14" fill="url(#db-bg)" />
      <path d="M 18 16 L 18 44 L 32 44 Q 44 44 44 30 Q 44 16 32 16 Z" fill="none" stroke="url(#db-d)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="44" cy="30" r="3" fill="#00E5B0" />
    </svg>
  );
}

export function Logo({ size = 36, color = 'white' }: { size?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color }}>
        Das<span style={{ color: '#00D4A0' }}>Bank</span>
      </span>
    </div>
  );
}
