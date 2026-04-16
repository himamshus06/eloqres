import { useState, useCallback } from 'react';
import { type ResumeData, type TemplateType, initialResumeData } from '@/lib/resume-types';
import { WizardForm } from '@/components/resume/WizardSteps';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { UploadMode } from '@/components/resume/UploadMode';
import { FileText, Upload, ArrowLeft, Download, Copy, Printer, Check, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const ACCENT_COLORS = ['#C45D3E', '#2563EB', '#059669', '#D97706', '#0891B2', '#4F46E5', '#DC2626', '#64748B'];
const TEMPLATES: { value: TemplateType; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
];

function resumeToPlainText(data: ResumeData): string {
  const lines: string[] = [];
  const p = data.personal;
  if (p.name) lines.push(p.name.toUpperCase());
  if (p.title) lines.push(p.title);
  const contact = [p.email, p.phone, p.location].filter(Boolean).join(' | ');
  if (contact) lines.push(contact);
  const links = [p.linkedin, p.github, p.website].filter(Boolean).join(' | ');
  if (links) lines.push(links);
  lines.push('');

  if (data.summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(data.summary);
    lines.push('');
  }

  if (data.experience.length > 0) {
    lines.push('EXPERIENCE');
    data.experience.forEach(exp => {
      lines.push(`${exp.title} — ${exp.company}`);
      lines.push(`${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`);
      exp.bullets.forEach(b => lines.push(`• ${b}`));
      lines.push('');
    });
  }

  if (data.education.length > 0) {
    lines.push('EDUCATION');
    data.education.forEach(edu => {
      lines.push(`${edu.degree} — ${edu.school} (${edu.year})`);
      if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
      if (edu.honors) lines.push(edu.honors);
      lines.push('');
    });
  }

  if (data.skills.some(c => c.skills.length > 0)) {
    lines.push('SKILLS');
    data.skills.filter(c => c.skills.length > 0).forEach(c => {
      lines.push(`${c.name}: ${c.skills.join(', ')}`);
    });
    lines.push('');
  }

  if (data.projects.length > 0) {
    lines.push('PROJECTS');
    data.projects.forEach(proj => {
      lines.push(`${proj.name}${proj.techStack ? ` (${proj.techStack})` : ''}`);
      if (proj.description) lines.push(proj.description);
      if (proj.link) lines.push(proj.link);
      lines.push('');
    });
  }

  return lines.join('\n');
}

export function ResumeBuilder() {
  const [mode, setMode] = useState<'select' | 'build' | 'upload'>('select');
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [template, setTemplate] = useState<TemplateType>('classic');
  const [accentColor, setAccentColor] = useState('#C45D3E');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans-serif'>('sans-serif');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const copyPlainText = useCallback(() => {
    const text = resumeToPlainText(resumeData);
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'));
  }, [resumeData]);

  const downloadHTML = useCallback(() => {
    const previewEl = document.getElementById('resume-preview-content');
    if (!previewEl) return;

    // Clone and collect all inline styles from the rendered preview
    const clone = previewEl.cloneNode(true) as HTMLElement;

    // Build comprehensive CSS for the standalone HTML file
    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: ${fontFamily === 'serif' ? "'Georgia', 'Times New Roman', serif" : "'DM Sans', system-ui, sans-serif"}; max-width: 800px; margin: 0 auto; color: #1a1a2e; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .flex { display: flex; }
      .flex-1 { flex: 1; }
      .flex-wrap { flex-wrap: wrap; }
      .items-baseline { align-items: baseline; }
      .items-center { align-items: center; }
      .justify-between { justify-content: space-between; }
      .justify-center { justify-content: center; }
      .gap-1 { gap: 0.25rem; }
      .gap-1\\.5 { gap: 0.375rem; }
      .gap-2 { gap: 0.5rem; }
      .gap-x-3 { column-gap: 0.75rem; }
      .gap-x-4 { column-gap: 1rem; }
      .gap-y-0\\.5 { row-gap: 0.125rem; }
      .text-center { text-align: center; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-medium { font-weight: 500; }
      .font-light { font-weight: 300; }
      .uppercase { text-transform: uppercase; }
      .leading-tight { line-height: 1.25; }
      .leading-relaxed { line-height: 1.625; }
      .tracking-tight { letter-spacing: -0.025em; }
      .tracking-wide { letter-spacing: 0.025em; }
      .tracking-wider { letter-spacing: 0.05em; }
      .tracking-widest { letter-spacing: 0.1em; }
      .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
      .space-y-1 > * + * { margin-top: 0.25rem; }
      .space-y-1\\.5 > * + * { margin-top: 0.375rem; }
      .mb-0\\.5 { margin-bottom: 0.125rem; }
      .mb-1 { margin-bottom: 0.25rem; }
      .mb-1\\.5 { margin-bottom: 0.375rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-3 { margin-bottom: 0.75rem; }
      .mb-4 { margin-bottom: 1rem; }
      .mb-5 { margin-bottom: 1.25rem; }
      .mb-6 { margin-bottom: 1.5rem; }
      .mt-0\\.5 { margin-top: 0.125rem; }
      .mt-1 { margin-top: 0.25rem; }
      .ml-1\\.5 { margin-left: 0.375rem; }
      .ml-2 { margin-left: 0.5rem; }
      .p-6 { padding: 1.5rem; }
      .p-8 { padding: 2rem; }
      .p-10 { padding: 2.5rem; }
      .px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
      .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
      .pb-6 { padding-bottom: 1.5rem; }
      .rounded { border-radius: 0.25rem; }
      .shrink-0 { flex-shrink: 0; }
      .min-h-\\[700px\\] { min-height: 700px; }
      .w-\\[38\\%\\] { width: 38%; }
      ul { list-style: none; padding: 0; }
      h1, h2, h3 { margin: 0; }
      @media print {
        body { margin: 0; padding: 0; max-width: 100%; }
      }
    `;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${resumeData.personal.name || 'Resume'}</title><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body>${clone.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personal.name || 'resume'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded HTML');
  }, [resumeData, fontFamily]);

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl tracking-tight mb-3">ResumeForge</h1>
            <p className="text-muted-foreground text-lg">Craft your story. Land the role.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('build')}
              className="bg-card border border-border rounded-lg p-8 text-left hover:border-primary/60 transition-all duration-200 group"
            >
              <FileText className="h-7 w-7 text-primary mb-5 transition-transform group-hover:scale-110" />
              <h2 className="text-lg font-semibold mb-1.5">Build From Scratch</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Guided wizard with AI-powered suggestions at every step.</p>
            </button>
            <button
              onClick={() => setMode('upload')}
              className="bg-card border border-border rounded-lg p-8 text-left hover:border-primary/60 transition-all duration-200 group"
            >
              <Upload className="h-7 w-7 text-primary mb-5 transition-transform group-hover:scale-110" />
              <h2 className="text-lg font-semibold mb-1.5">Upload & Improve</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Paste your existing resume for AI analysis and scoring.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="no-print border-b border-border px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('select')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="font-heading text-lg">ResumeForge</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Templates */}
          <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-md p-0.5">
            {TEMPLATES.map(t => (
              <button
                key={t.value}
                onClick={() => setTemplate(t.value)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${template === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="hidden md:flex items-center gap-1">
            {ACCENT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                className="w-4 h-4 rounded-full border border-border/50 transition-transform hover:scale-125 flex items-center justify-center"
                style={{ backgroundColor: c }}
              >
                {accentColor === c && <Check className="h-2.5 w-2.5 text-white" />}
              </button>
            ))}
          </div>

          {/* Font */}
          <button
            onClick={() => setFontFamily(f => f === 'serif' ? 'sans-serif' : 'serif')}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 border border-border rounded transition-colors hidden sm:block"
          >
            {fontFamily === 'serif' ? 'Serif' : 'Sans'}
          </button>

          {/* Export */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyPlainText} title="Copy as plain text">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={downloadHTML} title="Download HTML">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.print()} title="Print">
              <Printer className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="no-print lg:hidden border-b border-border flex">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mobileTab === 'editor' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mobileTab === 'preview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
        >
          Preview
        </button>
      </div>

      {/* Mobile template/color controls */}
      {mobileTab === 'preview' && (
        <div className="no-print lg:hidden border-b border-border px-4 py-2 flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5 shrink-0">
            {TEMPLATES.map(t => (
              <button
                key={t.value}
                onClick={() => setTemplate(t.value)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${template === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {ACCENT_COLORS.map(c => (
              <button key={c} onClick={() => setAccentColor(c)} className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: c }}>
                {accentColor === c && <Check className="h-2.5 w-2.5 text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        <div className={`w-full lg:w-[45%] overflow-y-auto lg:border-r border-border ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`}>
          {mode === 'build' ? (
            <WizardForm resumeData={resumeData} setResumeData={setResumeData} aiLoading={aiLoading} setAiLoading={setAiLoading} />
          ) : (
            <UploadMode resumeData={resumeData} setResumeData={setResumeData} onSwitchToBuild={() => setMode('build')} />
          )}
        </div>
        <div className={`w-full lg:w-[55%] overflow-y-auto bg-muted/30 ${mobileTab !== 'preview' ? 'hidden lg:block' : ''}`}>
          <ResumePreview resumeData={resumeData} template={template} accentColor={accentColor} fontFamily={fontFamily} />
        </div>
      </main>
    </div>
  );
}
