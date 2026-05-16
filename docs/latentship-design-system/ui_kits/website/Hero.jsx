// LatentShip — Hero section component

const Hero = ({ onNavigate }) => {
  const timeline = [
    { label: 'Week 1', text: 'Scoped proof for a critical workflow' },
    { label: 'Weeks 2+', text: 'MVP build with production foundations' },
    { label: 'Launch', text: 'Release, instrument, and iterate from usage' },
  ];

  return (
    <section style={{ padding: '40px 0 32px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1.12fr 0.88fr', gap: 16 }}>

        {/* Left — copy panel */}
        <div style={{
          border: '1px solid rgba(18,32,24,0.12)', borderRadius: 26,
          background: 'color-mix(in srgb, white 70%, #eff8e8 30%)',
          boxShadow: '0 20px 40px rgba(21,35,26,0.09)',
          padding: 32, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(circle at 100% 0%, rgba(123,181,59,0.17) 0%, transparent 40%), linear-gradient(140deg, transparent 54%, rgba(210,236,181,0.25) 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a6422' }}>
              AI-native product + engineering team
            </p>
            <p style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: '#334a3b' }}>
              AI-agentic workflow builders for operations-heavy teams.
            </p>
            <h1 style={{
              marginTop: 10, fontFamily: '"Sora", sans-serif', fontSize: 'clamp(30px,4.3vw,52px)',
              fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#132019',
              maxWidth: '14ch', textWrap: 'balance',
            }}>
              We turn messy workflows into AI-agentic products teams actually use.
            </h1>
            <p style={{ marginTop: 16, color: '#3d4f44', fontSize: 16, lineHeight: 1.55, maxWidth: '52ch' }}>
              We map business friction into practical AI systems with clear UX, automation, and production-ready delivery.
            </p>
            <ul style={{ margin: '18px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {['Custom AI agents, workflow automation, and maintainable handoff-ready builds.'].map((b, i) => (
                <li key={i} style={{ fontSize: 16, color: '#27392f', paddingLeft: 24, position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 2, top: '0.62em',
                    width: 9, height: 9, borderRadius: '50%', background: '#6fb23a',
                    boxShadow: '0 0 0 4px rgba(217,239,197,0.85)', display: 'block',
                  }} />
                  {b}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <a href="#" onClick={e => { e.preventDefault(); onNavigate('get-started'); }}
                style={{
                  textDecoration: 'none', borderRadius: 999, minHeight: 44, display: 'inline-flex',
                  alignItems: 'center', fontSize: 14, fontWeight: 800, padding: '0 16px',
                  border: '1px solid #0f1914', background: '#14211a', color: '#f7fbf5',
                  boxShadow: '0 12px 26px rgba(18,32,24,0.16)',
                }}>
                Book a 15-min scoping call <ArrowIcon />
              </a>
              <a href="#" onClick={e => { e.preventDefault(); onNavigate('work'); }}
                style={{
                  textDecoration: 'none', borderRadius: 999, minHeight: 40, display: 'inline-flex',
                  alignItems: 'center', fontSize: 14, fontWeight: 700, padding: '8px 12px',
                  border: '1px solid rgba(18,32,24,0.14)',
                  background: 'color-mix(in srgb, white 65%, #edf7e4 35%)', color: '#213228',
                }}>
                See recent builds
              </a>
            </div>
          </div>
        </div>

        {/* Right — dark card */}
        <div style={{
          color: '#f4f8f2', borderRadius: 26,
          border: '1px solid rgba(144,203,83,0.24)',
          background: 'radial-gradient(circle at 12% 12%, rgba(139,200,75,0.28) 0%, transparent 36%), linear-gradient(150deg, #152019 0%, #0f1813 55%, #111c16 100%)',
          padding: 28, display: 'grid', gap: 14, minHeight: 400,
          boxShadow: '0 30px 64px rgba(18,28,22,0.12)',
          position: 'relative', overflow: 'hidden',
        }}>
          <p style={{ fontSize: 14, color: '#d4dfd1', fontWeight: 700, position: 'relative', zIndex: 1 }}>POC → MVP → Launch + Iterate</p>
          <h2 style={{
            fontFamily: '"Sora",sans-serif', fontSize: 'clamp(22px,2.8vw,32px)',
            fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em',
            color: '#f4f8f2', maxWidth: '18ch', position: 'relative', zIndex: 1,
          }}>
            Scoped proof for a critical flow, then production-ready MVP delivery.
          </h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10, position: 'relative', zIndex: 1 }}>
            {timeline.map((t, i) => (
              <li key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 10, color: '#e7eee4', fontSize: 14 }}>
                <span style={{ color: '#b1e17b', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t.label}</span>
                <span>{t.text}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'auto', marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: 8, minHeight: 100, position: 'relative', zIndex: 1 }}>
            {[['56%', '#b8dd8f'], ['78%', '#91c95d'], ['100%', '#6aac38']].map(([h, bg], i) => (
              <div key={i} style={{ width: 44, height: h, background: bg, borderRadius: '6px 6px 0 0', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Hero });
