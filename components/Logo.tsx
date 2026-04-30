// Logo DasBank — Tech minimalista (preto + verde-menta)
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect x="2" y="2" width="56" height="56" rx="12" fill="#0A0A0A" />
      <rect x="2" y="2" width="56" height="56" rx="12" fill="none" stroke="#00FFB3" strokeWidth="0.8" opacity="0.4" />
      <circle cx="30" cy="30" r="14" fill="none" stroke="#00FFB3" strokeWidth="2.2" />
      <path d="M 24 22 L 24 38 L 32 38 Q 39 38 39 30 Q 39 22 32 22 Z" fill="#00FFB3" />
      <circle cx="42" cy="22" r="2" fill="#00FFB3" />
    </svg>
  );
}

export function Logo({ size = 36, color = 'white' }: { size?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color }}>
        Das<span style={{ color: '#00FFB3' }}>Bank</span>
      </span>
    </div>
  );
}
