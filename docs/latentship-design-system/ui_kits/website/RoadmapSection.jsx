// LatentShip — Roadmap Section component

const RoadmapSection = () => {
  const steps = [
    {
      phase: 'Step 1', title: 'POC in ~7 Days (Scoped)', timeline: '~1 week',
      detail: 'We isolate the highest-leverage workflow, define success criteria, and ship a working proof to validate direction.',
      deliverables: ['Scope brief', 'Working flow proof', 'Go/no-go recommendation'],
    },
    {
      phase: 'Step 2', title: 'MVP Build (Production Baseline)', timeline: 'Typical 3–6 weeks',
      detail: 'We harden validated scope into a launch-ready MVP with maintainable architecture, tests, and deployment readiness.',
      deliverables: ['Core product workflows', 'Testing + CI baseline', 'Deployment-ready setup'],
    },
    {
      phase: 'Step 3', title: 'Launch + Iterate', timeline: 'Ongoing',
      detail: 'We launch with QA and monitoring, then prioritize iteration from real user behavior and operational feedback.',
      deliverables: ['Release support', 'Usage feedback loop', 'Prioritized iteration backlog'],
    },
  ];

  const trustCards = [
    { label: 'Validation model', heading: 'Scoped POC First', copy: 'Start narrow, validate quickly, and invest with more confidence in product direction.' },
    { label: 'Execution model', heading: 'Clear Operating Rhythm', copy: 'Weekly demos, async updates, and tracked decisions keep progress and tradeoffs explicit.' },
    { label: 'Handoff model', heading: 'Production Handoff', copy: 'Code ownership, runbooks, architecture notes, and practical transition support are built in.' },
  ];

  return (
    <section style={{ padding: '64px 0' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a6422' }}>Delivery roadmap</p>
          <h2 style={{ fontFamily: '"Sora",sans-serif', fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#132019' }}>
            POC first, production build next, then measured iteration.
          </h2>
          <p style={{ color: '#3d4f44', fontSize: 16, lineHeight: 1.62, maxWidth: '70ch' }}>
            We translate ambiguous workflow problems into scoped product decisions and reliable delivery plans.
          </p>
          <p style={{ marginTop: 2, color: '#2f4438', fontSize: 14, fontWeight: 700 }}>
            Weekly demos, shared decision logs, and explicit acceptance criteria keep execution transparent.
          </p>
        </div>

        {/* Roadmap stage */}
        <div style={{
          marginTop: 24, background: 'linear-gradient(145deg, #deefc8 0%, #d2e8b7 46%, #f4faeb 100%)',
          borderRadius: 28, border: '1px solid rgba(14,20,8,0.1)',
          padding: 24, boxShadow: '0 22px 46px rgba(73,101,40,0.11)',
        }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#243617', fontWeight: 800 }}>Typical MVP build: 3–6 weeks depending on scope and integrations</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                border: '1px solid rgba(25,32,18,0.11)', borderRadius: 18,
                background: 'rgba(251,254,247,0.82)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                padding: 18, minHeight: 190,
              }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a6422' }}>{s.phase}</p>
                <h3 style={{ marginTop: 10, fontFamily: '"Sora",sans-serif', fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#132019' }}>{s.title}</h3>
                <p style={{ marginTop: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#647364' }}>{s.timeline}</p>
                <p style={{ marginTop: 8, color: '#3d4f44', fontSize: 13, lineHeight: 1.5 }}>{s.detail}</p>
                <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
                  {s.deliverables.map((d, j) => (
                    <li key={j} style={{ fontSize: 11, color: '#37483e', border: '1px solid rgba(10,16,18,0.14)', borderRadius: 12, padding: '5px 8px', background: '#f8fcef' }}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Trust cards */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {trustCards.map((c, i) => (
            <div key={i} style={{ border: '1px solid rgba(18,32,24,0.12)', borderRadius: 18, background: '#f9fdf4', padding: 20, boxShadow: '0 10px 22px rgba(26,42,29,0.07)' }}>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6d7d73' }}>{c.label}</p>
              <h3 style={{ marginTop: 10, fontFamily: '"Sora",sans-serif', fontSize: 'clamp(22px,2.5vw,28px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#132019' }}>{c.heading}</h3>
              <p style={{ marginTop: 8, color: '#3d4f44', fontSize: 13 }}>{c.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { RoadmapSection });
