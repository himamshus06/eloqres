import type { ResumeData, TemplateType } from '@/lib/resume-types';

interface PreviewProps {
  resumeData: ResumeData;
  template: TemplateType;
  accentColor: string;
  fontFamily: 'serif' | 'sans-serif';
}

export function ResumePreview({ resumeData, template, accentColor, fontFamily }: PreviewProps) {
  const hasContent = resumeData.personal.name || resumeData.summary || resumeData.experience.length > 0;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-20 mx-auto mb-4 border-2 border-dashed border-border rounded-sm" />
          <p className="text-muted-foreground text-sm">Your resume preview will appear here</p>
          <p className="text-muted-foreground text-xs mt-1">Start filling in your details</p>
        </div>
      </div>
    );
  }

  const font = fontFamily === 'serif' ? "'Georgia', 'Times New Roman', serif" : "'DM Sans', system-ui, sans-serif";

  return (
    <div className="p-4 md:p-6 flex justify-center">
      <div
        id="resume-preview-content"
        className="w-full max-w-[680px] resume-paper rounded shadow-lg"
        style={{ fontFamily: font }}
      >
        {template === 'classic' && <ClassicTemplate data={resumeData} accent={accentColor} />}
        {template === 'modern' && <ModernTemplate data={resumeData} accent={accentColor} />}
        {template === 'minimal' && <MinimalTemplate data={resumeData} accent={accentColor} />}
      </div>
    </div>
  );
}

function SectionTitle({ children, accent, className = '' }: { children: React.ReactNode; accent: string; className?: string }) {
  return (
    <h2 className={`text-[13px] font-bold uppercase tracking-wider mb-2 ${className}`} style={{ color: accent }}>
      {children}
    </h2>
  );
}

/* ──────────────── CLASSIC TEMPLATE ──────────────── */
function ClassicTemplate({ data, accent }: { data: ResumeData; accent: string }) {
  const p = data.personal;
  return (
    <div className="p-8 text-[11px] leading-[1.55]" style={{ color: '#1a1a2e' }}>
      {/* Header */}
      <div className="text-center mb-5">
        {p.name && <h1 className="text-[22px] font-bold tracking-tight mb-0.5" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{p.name}</h1>}
        {p.title && <p className="text-[13px] mb-1.5" style={{ color: accent }}>{p.title}</p>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[10px]" style={{ color: '#666' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </div>

      <hr className="border-t mb-4" style={{ borderColor: accent + '40' }} />

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <SectionTitle accent={accent}>Summary</SectionTitle>
          <p>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-4">
          <SectionTitle accent={accent}>Experience</SectionTitle>
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-[12px]">{exp.title}</span>
                  {exp.company && <span className="ml-1.5" style={{ color: '#666' }}>— {exp.company}</span>}
                </div>
                <span className="text-[10px] shrink-0 ml-2" style={{ color: '#888' }}>
                  {exp.startDate}{exp.startDate && ' – '}{exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.bullets.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex gap-1.5"><span style={{ color: accent }}>•</span><span>{b}</span></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <SectionTitle accent={accent}>Education</SectionTitle>
          {data.education.map(edu => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-[12px]">{edu.degree}</span>
                  {edu.school && <span className="ml-1.5" style={{ color: '#666' }}>— {edu.school}</span>}
                </div>
                {edu.year && <span className="text-[10px]" style={{ color: '#888' }}>{edu.year}</span>}
              </div>
              <div className="text-[10px]" style={{ color: '#888' }}>
                {edu.gpa && <span>GPA: {edu.gpa}</span>}
                {edu.gpa && edu.honors && <span> | </span>}
                {edu.honors && <span>{edu.honors}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.some(c => c.skills.length > 0) && (
        <div className="mb-4">
          <SectionTitle accent={accent}>Skills</SectionTitle>
          <div className="space-y-1">
            {data.skills.filter(c => c.skills.length > 0).map(c => (
              <div key={c.id}>
                <span className="font-semibold">{c.name}: </span>
                <span>{c.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div>
          <SectionTitle accent={accent}>Projects</SectionTitle>
          {data.projects.map(proj => (
            <div key={proj.id} className="mb-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[12px]">{proj.name}</span>
                {proj.techStack && <span className="text-[10px]" style={{ color: '#888' }}>({proj.techStack})</span>}
              </div>
              {proj.description && <p className="mt-0.5">{proj.description}</p>}
              {proj.link && <p className="text-[10px] mt-0.5" style={{ color: accent }}>{proj.link}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────── MODERN TEMPLATE ──────────────── */
function ModernTemplate({ data, accent }: { data: ResumeData; accent: string }) {
  const p = data.personal;
  return (
    <div className="flex min-h-[700px]" style={{ color: '#1a1a2e' }}>
      {/* Sidebar */}
      <div className="w-[38%] p-6 text-[10px] leading-[1.5]" style={{ backgroundColor: accent + '12' }}>
        {p.name && <h1 className="text-[18px] font-bold mb-0.5 leading-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{p.name}</h1>}
        {p.title && <p className="text-[11px] font-medium mb-4" style={{ color: accent }}>{p.title}</p>}

        {/* Contact */}
        <div className="space-y-1.5 mb-5">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>Contact</p>
          {p.email && <p>{p.email}</p>}
          {p.phone && <p>{p.phone}</p>}
          {p.location && <p>{p.location}</p>}
          {p.linkedin && <p>{p.linkedin}</p>}
          {p.github && <p>{p.github}</p>}
          {p.website && <p>{p.website}</p>}
        </div>

        {/* Skills */}
        {data.skills.some(c => c.skills.length > 0) && (
          <div className="mb-5">
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Skills</p>
            {data.skills.filter(c => c.skills.length > 0).map(c => (
              <div key={c.id} className="mb-2">
                <p className="font-semibold text-[10px] mb-0.5">{c.name}</p>
                <div className="flex flex-wrap gap-1">
                  {c.skills.map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: accent + '20' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Education</p>
            {data.education.map(edu => (
              <div key={edu.id} className="mb-2">
                <p className="font-semibold text-[10px]">{edu.degree}</p>
                {edu.school && <p style={{ color: '#666' }}>{edu.school}</p>}
                {edu.year && <p style={{ color: '#888' }}>{edu.year}</p>}
                {edu.gpa && <p style={{ color: '#888' }}>GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 p-6 text-[11px] leading-[1.55]">
        {data.summary && (
          <div className="mb-5">
            <SectionTitle accent={accent}>Profile</SectionTitle>
            <p>{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-5">
            <SectionTitle accent={accent}>Experience</SectionTitle>
            {data.experience.map(exp => (
              <div key={exp.id} className="mb-3">
                <p className="font-bold text-[12px]">{exp.title}</p>
                <div className="flex justify-between text-[10px]" style={{ color: '#888' }}>
                  <span>{exp.company}</span>
                  <span>{exp.startDate}{exp.startDate && ' – '}{exp.current ? 'Present' : exp.endDate}</span>
                </div>
                {exp.bullets.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} className="flex gap-1.5"><span style={{ color: accent }}>•</span><span>{b}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div>
            <SectionTitle accent={accent}>Projects</SectionTitle>
            {data.projects.map(proj => (
              <div key={proj.id} className="mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-[12px]">{proj.name}</span>
                  {proj.techStack && <span className="text-[10px]" style={{ color: '#888' }}>({proj.techStack})</span>}
                </div>
                {proj.description && <p className="mt-0.5">{proj.description}</p>}
                {proj.link && <p className="text-[10px] mt-0.5" style={{ color: accent }}>{proj.link}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────── MINIMAL TEMPLATE ──────────────── */
function MinimalTemplate({ data, accent }: { data: ResumeData; accent: string }) {
  const p = data.personal;
  return (
    <div className="p-10 text-[11px] leading-[1.6]" style={{ color: '#1a1a2e' }}>
      {/* Header */}
      <div className="mb-6">
        {p.name && <h1 className="text-[28px] font-light tracking-tight mb-0.5" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{p.name}</h1>}
        {p.title && <p className="text-[14px] font-light tracking-wide mb-2" style={{ color: '#666' }}>{p.title}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px]" style={{ color: '#999' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6 pb-6" style={{ borderBottom: `1px solid ${accent}25` }}>
          <p className="text-[12px] leading-relaxed" style={{ color: '#444' }}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>Experience</h2>
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-0.5">
                <p className="text-[13px] font-medium">{exp.title}</p>
                <span className="text-[10px]" style={{ color: '#aaa' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              {exp.company && <p className="text-[11px] mb-1" style={{ color: '#888' }}>{exp.company}</p>}
              {exp.bullets.length > 0 && (
                <ul className="space-y-0.5">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex gap-2"><span style={{ color: accent }}>—</span><span>{b}</span></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>Education</h2>
          {data.education.map(edu => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-[12px] font-medium">{edu.degree}{edu.school && <span className="font-normal" style={{ color: '#888' }}> — {edu.school}</span>}</p>
                {edu.year && <span className="text-[10px]" style={{ color: '#aaa' }}>{edu.year}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.some(c => c.skills.length > 0) && (
        <div className="mb-6">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>Skills</h2>
          <div className="space-y-1">
            {data.skills.filter(c => c.skills.length > 0).map(c => (
              <p key={c.id}><span className="font-medium">{c.name}:</span> {c.skills.join(' · ')}</p>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>Projects</h2>
          {data.projects.map(proj => (
            <div key={proj.id} className="mb-3">
              <p className="text-[12px] font-medium">{proj.name}</p>
              {proj.techStack && <p className="text-[10px] mb-0.5" style={{ color: '#888' }}>{proj.techStack}</p>}
              {proj.description && <p>{proj.description}</p>}
              {proj.link && <p className="text-[10px]" style={{ color: accent }}>{proj.link}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
