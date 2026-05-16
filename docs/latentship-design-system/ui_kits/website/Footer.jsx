// LatentShip — Footer component

const Footer = ({ onNavigate }) => {
  return (
    <footer style={{ padding: '64px 0' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px' }}>
        {/* CTA block */}
        <div style={{
          color: '#f4f8f2', borderRadius: 26,
          border: '1px solid rgba(144,203,83,0.24)',
          background: 'radial-gradient(circle at 12% 12%, rgba(139,200,75,0.28) 0%, transparent 36%), linear-gradient(150deg, #152019 0%, #0f1813 55%, #111c16 100%)',
          padding: 32, marginBottom: 16,
        }}>
          <h2 style={{ fontFamily: '"Sora",sans-serif', fontSize: 'clamp(32px,4.5vw,48px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#f4f8f2' }}>
            Ready to ship your next product?
          </h2>
          <div style={{ marginTop: 16 }}>
            <a href="#" onClick={e => { e.preventDefault(); onNavigate('get-started'); }}
              style={{
                textDecoration: 'none', borderRadius: 999, minHeight: 44,
                display: 'inline-flex', alignItems: 'center',
                fontSize: 14, fontWeight: 800, padding: '0 18px',
                background: '#f6faf3', color: '#0f1914', borderColor: 'transparent',
              }}>
              Book a 15-min scoping call <ArrowIcon />
            </a>
          </div>
          <p style={{ marginTop: 12, color: '#d3dfcd', fontSize: 13 }}>Response within 1 business day.</p>
        </div>

        {/* Footer grid */}
        <div style={{
          border: '1px solid rgba(18,32,24,0.12)', borderRadius: 26,
          background: 'color-mix(in srgb, white 70%, #eff8e8 30%)',
          boxShadow: '0 10px 22px rgba(26,42,29,0.07)',
          padding: 24, display: 'grid',
          gridTemplateColumns: '1.3fr 1fr 1fr', gap: 20,
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64747d' }}>Company</p>
            <p style={{ marginTop: 8, fontSize: 16, fontWeight: 800, color: '#132019' }}>LatentShip</p>
            <p style={{ marginTop: 8, color: '#3d4f44', fontSize: 13 }}>AI-native product + engineering team focused on practical, production-minded delivery.</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64747d' }}>Contact</p>
            <p style={{ marginTop: 8, fontSize: 14, color: '#132019' }}>hello@latentship.com</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64747d' }}>Model</p>
            <p style={{ marginTop: 8, fontSize: 14, color: '#132019' }}>POC → MVP → Launch + Iterate</p>
            <p style={{ marginTop: 4, fontSize: 13, color: '#3d4f44' }}>Source code ownership. Optional retainer.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

Object.assign(window, { Footer });
