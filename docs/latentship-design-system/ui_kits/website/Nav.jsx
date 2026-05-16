// LatentShip — Nav component
// Pill navbar with animated active indicator, brand mark SVG, green CTA

const BrandMark = ({ dark = false }) => (
  <svg width="24" height="24" viewBox="-2 -2 28 28" aria-hidden="true" style={{ filter: 'drop-shadow(0 2px 6px rgba(70,130,25,0.25))' }}>
    <circle cx="12" cy="12" r="13.5" fill={dark ? '#1c2e1e' : '#eef7e2'} stroke={dark ? 'rgba(144,203,83,0.32)' : '#b6d98a'} strokeWidth="1.2"/>
    {/* Exhaust dot */}
    <path d="M6.517,17.569c-1.157-1.145-3.364-.909-4.379,.121-1.132,1.149-1.008,3.87-.959,4.381,.046,.483,.432,.863,.916,.902,.13,.01,3.028,.294,4.356-1.019,.97-1.049,1.218-3.185,.066-4.386Z" fill={dark ? '#4a7a2a' : '#3a6422'}/>
    {/* Body + porthole */}
    <path d="M18.196,15.759c6.363-6.464,4.385-13.443,4.298-13.737-.097-.323-.348-.576-.67-.672-.291-.088-7.207-2.073-13.552,4.372L3.631,10.436c-.63,.641-.9,1.553-.719,2.44,.175,.862,.755,1.576,1.557,1.908,1.154,.479,2.107,1.101,2.896,1.896,.768,.78,1.353,1.791,1.869,2.95,1.041,2.336,3.666,1.747,4.321,.844l4.641-4.715Zm-6.125-3.801l-.029-.029c-1.636-1.662-.703-3.106,0-3.82,.611-.62,2.095-1.71,3.805,0,1.649,1.649,.703,3.106,0,3.82-.61,.62-2.05,1.755-3.776,.029Z" fill={dark ? '#6fb23a' : '#5b9830'}/>
    {/* Upper-left fin accent */}
    <path d="M2.206,9.034L6.847,4.32c.45-.457,.904-.877,1.359-1.262-1.382-.48-2.856-.22-3.73,.192-1.688,.795-2.935,2.844-3.072,3.075-.075,.127-.121,.268-.135,.415-.021,.215-.129,1.627,.358,3.012,.167-.255,.36-.495,.578-.717Z" fill={dark ? '#91c95d' : '#79ba37'}/>
    {/* Lower-right fin accent */}
    <path d="M20.638,19.608c.402-.881,.642-2.367,.172-3.762-.364,.44-.76,.88-1.189,1.316l-4.641,4.715c-.233,.237-.488,.445-.759,.624,1.365,.49,2.751,.386,2.964,.366,.151-.014,.298-.062,.428-.142,.227-.138,2.245-1.405,3.026-3.117Z" fill={dark ? '#91c95d' : '#79ba37'}/>
  </svg>
);

const ArrowIcon = ({ style }) => (
  <span style={{
    display: 'inline-block', width: 15, height: 15,
    background: 'currentColor', marginLeft: 6, verticalAlign: 'middle', flexShrink: 0,
    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 12a2 2 0 0 0-.59-1.4l-4.29-4.3a1 1 0 1 0-1.41 1.42L15 11H5a1 1 0 1 0 0 2h10l-3.29 3.29a1 1 0 1 0 1.41 1.42l4.29-4.3A2 2 0 0 0 18 12Z'/%3E%3C/svg%3E")`,
    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 12a2 2 0 0 0-.59-1.4l-4.29-4.3a1 1 0 1 0-1.41 1.42L15 11H5a1 1 0 1 0 0 2h10l-3.29 3.29a1 1 0 1 0 1.41 1.42l4.29-4.3A2 2 0 0 0 18 12Z'/%3E%3C/svg%3E")`,
    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain', maskSize: 'contain',
    ...style
  }} />
);

const Nav = ({ activePage, onNavigate }) => {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'work', label: 'Our Work' },
    { id: 'about', label: 'About Us' },
  ];

  return (
    <header style={{ paddingTop: 20 }}>
      <div style={{
        maxWidth: 1140, margin: '0 auto', padding: '0 20px',
        border: '1px solid rgba(18,32,24,0.12)',
        background: 'color-mix(in srgb, #ffffff 84%, #eaf6de 16%)',
        borderRadius: 999, padding: '10px 14px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto',
        gap: 10, alignItems: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 22px rgba(26,42,29,0.07)',
      }}>
        {/* Brand */}
        <a href="#" onClick={e => { e.preventDefault(); onNavigate('home'); }}
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <BrandMark dark={false} />
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.02em', color: '#132019' }}>LatentShip</span>
        </a>

        {/* Nav links */}
        <div style={{
          justifySelf: 'center', display: 'flex', gap: 4, padding: 4,
          borderRadius: 999,
          background: 'color-mix(in srgb, #f3f9ed 84%, #ffffff 16%)',
          border: '1px solid rgba(18,32,24,0.1)',
          position: 'relative',
        }}>
          {links.map(link => (
            <a key={link.id} href="#"
              onClick={e => { e.preventDefault(); onNavigate(link.id); }}
              style={{
                textDecoration: 'none', fontSize: 13, fontWeight: 700,
                borderRadius: 999, padding: '0 14px', minHeight: 38,
                display: 'inline-flex', alignItems: 'center',
                background: activePage === link.id ? '#13201a' : 'transparent',
                color: activePage === link.id ? '#f4f8f2' : '#2b3a32',
                transition: 'all 140ms cubic-bezier(0.2,0.8,0.2,1)',
              }}>{link.label}</a>
          ))}
        </div>

        {/* CTA */}
        <a href="#" onClick={e => { e.preventDefault(); onNavigate('get-started'); }}
          style={{
            textDecoration: 'none', borderRadius: 999, minHeight: 40,
            display: 'inline-flex', alignItems: 'center',
            fontSize: 13, fontWeight: 800, padding: '0 14px',
            border: '1px solid #5b9830', background: '#6fb23a', color: '#112018',
            boxShadow: '0 12px 22px rgba(106,168,54,0.2)',
            transition: 'all 140ms cubic-bezier(0.2,0.8,0.2,1)',
            whiteSpace: 'nowrap',
          }}>
          Book a 15-min scoping call <ArrowIcon />
        </a>
      </div>
    </header>
  );
};

Object.assign(window, { Nav, ArrowIcon, BrandMark });
