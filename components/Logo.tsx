// Logo D — V com pino. SVG inline para usar em qualquer lugar.
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="vc-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16213E" />
          <stop offset="100%" stopColor="#0F0F1F" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="56" height="56" rx="14" fill="url(#vc-logo-bg)" />
      <path d="M 14 18 L 30 46 L 46 18" stroke="#E94560" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="11" r="3.5" fill="#E94560" />
    </svg>
  );
}

export function Logo({ size = 34, color = 'white' }: { size?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color }}>VagaCerta</span>
    </div>
  );
}
