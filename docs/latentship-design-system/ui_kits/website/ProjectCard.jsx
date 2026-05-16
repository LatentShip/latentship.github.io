// LatentShip — Project Card component

const PROJECTS = [
  {
    slug: 'aaroha-academy', title: 'Aaroha Academy', industry: 'AI Systems',
    summary: 'AI-enabled learning and coaching platform with role-based workspaces, streaming coach interactions, transcription, and privacy-aware learner support.',
    posterLine: 'AI coach + structured learning operations', duration: '6 weeks',
    tags: ['AI Systems', 'EdTech'],
    preview: 'linear-gradient(140deg, #0e1729 0%, #4b67a4 40%, #b5e67a 100%)',
    image: '../../assets/AarohaAcademy_1.png',
  },
  {
    slug: 'algobullion', title: 'AlgoBullion', industry: 'FinTech',
    summary: 'Real-time bullion trading and pricing platform combining live market visibility, tenant-aware pricing, and trading operations.',
    posterLine: 'Live pricing + trading desk control', duration: '5 weeks',
    tags: ['FinTech', 'Operational Platforms'],
    preview: 'linear-gradient(140deg, #13211c 0%, #224d3f 45%, #a5dd63 100%)',
    image: '../../assets/AlgoBullion_1.png',
  },
  {
    slug: 'bilkool-ezee', title: 'Bilkool Ezee', industry: 'Operational Platforms',
    summary: 'Procurement operations platform for branded merchandise — ordering, shipment visibility, invoicing, and supplier coordination in one workflow.',
    posterLine: 'Unified procurement operations workflow', duration: '8 weeks',
    tags: ['Operational Platforms'],
    preview: 'linear-gradient(140deg, #b5e67a 0%, #d7f2ae 46%, #0f1218 100%)',
    image: '../../assets/BilkoolEzee_1.png',
  },
  {
    slug: 'deepreflekt', title: 'DeepReflekt', industry: 'Coaching',
    summary: 'Leadership coaching platform centered on reflection capture, collaborative coaching workflows, and AI-assisted insight generation.',
    posterLine: 'Reflection-led coaching continuity', duration: '7 weeks',
    tags: ['AI Systems', 'Coaching'],
    preview: 'linear-gradient(140deg, #101012 0%, #3a3a55 42%, #9fd957 100%)',
    image: '../../assets/DeepReflekt_1.png',
  },
];

const ProjectCard = ({ project, onClick, compact }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={() => onClick && onClick(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid rgba(18,32,24,0.12)', borderRadius: 18, overflow: 'hidden',
        background: '#f9fdf5', textDecoration: 'none', display: 'block',
        boxShadow: hovered ? '0 20px 34px rgba(19,33,24,0.13)' : '0 10px 22px rgba(26,42,29,0.07)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 220ms cubic-bezier(0.2,0.8,0.2,1)',
        cursor: 'pointer',
      }}>
      {/* Preview image */}
      <div style={{ minHeight: 148, position: 'relative', overflow: 'hidden', background: project.preview }}>
        {project.image && (
          <img src={project.image} alt={project.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'absolute', left: 10, right: 10, bottom: 10,
          background: 'rgba(9,14,16,0.74)', color: '#f2f7f0',
          borderRadius: 12, padding: '5px 10px',
          fontSize: 11, fontWeight: 800, letterSpacing: '0.02em', zIndex: 1,
        }}>{project.posterLine}</div>
      </div>
      {/* Body */}
      <div style={{ padding: 18 }}>
        <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#66766d' }}>{project.industry}</p>
        <h3 style={{ marginTop: 10, fontFamily: '"Sora",sans-serif', fontSize: 22, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#132019' }}>{project.title}</h3>
        {!compact && (
          <p style={{ marginTop: 8, color: '#3d4f44', fontSize: 13, lineHeight: 1.52, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.summary}</p>
        )}
        <div style={{ marginTop: 14, borderTop: '1px solid rgba(11,17,18,0.11)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {project.tags.slice(0, 2).map(tag => (
              <span key={tag} style={{ border: '1px solid rgba(10,16,18,0.14)', borderRadius: 999, fontSize: 11, padding: '3px 8px', background: '#edf7e3', color: '#33483e', fontWeight: 700 }}>{tag}</span>
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#667770', fontWeight: 700, whiteSpace: 'nowrap' }}>{project.duration}</span>
        </div>
      </div>
    </div>
  );
};

const ProjectGrid = ({ onSelectProject, filter }) => {
  const tags = ['All', 'AI Systems', 'FinTech', 'Operational Platforms', 'EdTech', 'Coaching'];
  const [activeTag, setActiveTag] = React.useState(filter || 'All');

  const filtered = activeTag === 'All' ? PROJECTS : PROJECTS.filter(p => p.tags.includes(activeTag));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {tags.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag)}
            style={{
              border: activeTag === tag ? '1px solid #122019' : '1px solid rgba(18,32,24,0.12)',
              borderRadius: 999, padding: '6px 14px', minHeight: 36,
              background: activeTag === tag ? '#122019' : '#f4f9ee',
              color: activeTag === tag ? '#eef6ea' : '#263830',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 140ms cubic-bezier(0.2,0.8,0.2,1)',
            }}>{tag}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map(p => <ProjectCard key={p.slug} project={p} onClick={onSelectProject} />)}
      </div>
    </div>
  );
};

Object.assign(window, { PROJECTS, ProjectCard, ProjectGrid });
