import { useState, useCallback } from 'react';
import { type ResumeData, type TemplateType, initialResumeData } from '@/lib/resume-types';
import { WizardForm } from '@/components/resume/WizardSteps';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { UploadMode } from '@/components/resume/UploadMode';
import { FileText, Upload, ArrowLeft, Download, Copy, Printer, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${resumeData.personal.name || 'Resume'}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a1a}h1,h2,h3{margin:0}*{box-sizing:border-box}</style></head><body>${previewEl.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personal.name || 'resume'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded HTML');
  }, [resumeData]);

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
