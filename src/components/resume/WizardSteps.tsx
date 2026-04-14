import { useState } from 'react';
import type { ResumeData, Experience, Education, Project, SkillCategory } from '@/lib/resume-types';
import { generateId } from '@/lib/resume-types';
import { generateBullets, generateSummary, suggestSkills, rewriteSection } from '@/lib/resume-ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Plus, Trash2, ChevronLeft, ChevronRight, Loader2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

interface StepProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  aiLoading: string | null;
  setAiLoading: (v: string | null) => void;
}

const STEPS = ['Personal', 'Summary', 'Experience', 'Education', 'Skills', 'Projects'];

export function WizardForm(props: StepProps) {
  const [step, setStep] = useState(0);
  const components = [PersonalInfoStep, SummaryStep, ExperienceStep, EducationStep, SkillsStep, ProjectsStep];
  const StepComponent = components[step];

  return (
    <div className="p-5">
      {/* Progress */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <button
              onClick={() => setStep(i)}
              className={`w-7 h-7 rounded-full text-[11px] font-medium flex items-center justify-center transition-all ${
                i === step
                  ? 'bg-primary text-primary-foreground scale-110'
                  : i < step
                  ? 'bg-primary/25 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-3 ${i < step ? 'bg-primary/40' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Step {step + 1} of {STEPS.length} — <span className="text-foreground font-medium">{STEPS[step]}</span>
      </p>

      {StepComponent && <StepComponent {...props} />}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-5 border-t border-border">
        <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="sm" onClick={() => setStep(s => s + 1)}>
            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground self-center">✓ All sections complete</p>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs text-muted-foreground mb-1 block">{children}</label>;
}

function PersonalInfoStep({ resumeData, setResumeData }: StepProps) {
  const update = (field: string, value: string) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };
  const p = resumeData.personal;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl mb-1">Personal Information</h2>
      <p className="text-sm text-muted-foreground mb-4">Let's start with the basics.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><FieldLabel>Full Name</FieldLabel><Input value={p.name} onChange={e => update('name', e.target.value)} placeholder="Jane Doe" /></div>
        <div><FieldLabel>Professional Title</FieldLabel><Input value={p.title} onChange={e => update('title', e.target.value)} placeholder="Senior Product Designer" /></div>
        <div><FieldLabel>Email</FieldLabel><Input type="email" value={p.email} onChange={e => update('email', e.target.value)} placeholder="jane@example.com" /></div>
        <div><FieldLabel>Phone</FieldLabel><Input value={p.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (555) 000-0000" /></div>
        <div className="sm:col-span-2"><FieldLabel>Location</FieldLabel><Input value={p.location} onChange={e => update('location', e.target.value)} placeholder="San Francisco, CA" /></div>
        <div><FieldLabel>LinkedIn</FieldLabel><Input value={p.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="linkedin.com/in/janedoe" /></div>
        <div><FieldLabel>GitHub / Portfolio</FieldLabel><Input value={p.github} onChange={e => update('github', e.target.value)} placeholder="github.com/janedoe" /></div>
        <div className="sm:col-span-2"><FieldLabel>Website</FieldLabel><Input value={p.website} onChange={e => update('website', e.target.value)} placeholder="janedoe.com" /></div>
      </div>
    </div>
  );
}

function SummaryStep({ resumeData, setResumeData, aiLoading, setAiLoading }: StepProps) {
  const [originalSummary, setOriginalSummary] = useState<string | null>(null);

  const handleGenerate = async () => {
    setAiLoading('summary');
    try {
      const result = await generateSummary({
        data: {
          title: resumeData.personal.title || 'Professional',
          years: '5+',
          skills: resumeData.skills.flatMap(c => c.skills).slice(0, 8).join(', ') || 'various technical skills',
        },
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        setOriginalSummary(resumeData.summary);
        setResumeData(prev => ({ ...prev, summary: result.summary }));
        toast.success('Summary generated');
      }
    } catch {
      toast.error('Failed to generate summary');
    }
    setAiLoading(null);
  };

  const handleEnhance = async () => {
    if (!resumeData.summary) return;
    setAiLoading('summary-enhance');
    try {
      const result = await rewriteSection({ data: { text: resumeData.summary, style: 'concise, impactful, and ATS-friendly' } });
      if (result.error) {
        toast.error(result.error);
      } else {
        setOriginalSummary(resumeData.summary);
        setResumeData(prev => ({ ...prev, summary: result.text }));
        toast.success('Summary enhanced');
      }
    } catch {
      toast.error('Enhancement failed');
    }
    setAiLoading(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl">Professional Summary</h2>
      <p className="text-sm text-muted-foreground">A compelling snapshot of your career.</p>
      <Textarea
        value={resumeData.summary}
        onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
        placeholder="Results-driven software engineer with 5+ years of experience..."
        rows={5}
        className="resize-none"
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={aiLoading !== null}>
          {aiLoading === 'summary' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
          Generate with AI
        </Button>
        <Button variant="outline" size="sm" onClick={handleEnhance} disabled={aiLoading !== null || !resumeData.summary}>
          {aiLoading === 'summary-enhance' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
          Enhance
        </Button>
        {originalSummary !== null && (
          <Button variant="ghost" size="sm" onClick={() => { setResumeData(prev => ({ ...prev, summary: originalSummary })); setOriginalSummary(null); }}>
            <Undo2 className="h-3.5 w-3.5 mr-1.5" /> Undo
          </Button>
        )}
      </div>
    </div>
  );
}

function ExperienceStep({ resumeData, setResumeData, aiLoading, setAiLoading }: StepProps) {
  const addExp = () => {
    const newExp: Experience = { id: generateId(), company: '', title: '', startDate: '', endDate: '', current: false, bullets: [], description: '' };
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExp = (id: string, field: string, value: string | boolean | string[]) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };

  const removeExp = (id: string) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const handleGenerateBullets = async (exp: Experience) => {
    setAiLoading(`bullets-${exp.id}`);
    try {
      const result = await generateBullets({ data: { jobTitle: exp.title, description: exp.description || exp.company } });
      if (result.error) {
        toast.error(result.error);
      } else {
        updateExp(exp.id, 'bullets', result.bullets);
        toast.success('Bullets generated');
      }
    } catch {
      toast.error('Failed to generate bullets');
    }
    setAiLoading(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl">Work Experience</h2>
      <p className="text-sm text-muted-foreground">Add your professional history.</p>

      {resumeData.experience.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm mb-3">No experience added yet</p>
          <Button variant="outline" size="sm" onClick={addExp}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Position</Button>
        </div>
      )}

      {resumeData.experience.map((exp, idx) => (
        <div key={exp.id} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Position {idx + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeExp(exp.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><FieldLabel>Job Title</FieldLabel><Input value={exp.title} onChange={e => updateExp(exp.id, 'title', e.target.value)} placeholder="Software Engineer" /></div>
            <div><FieldLabel>Company</FieldLabel><Input value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} placeholder="Acme Inc." /></div>
            <div><FieldLabel>Start Date</FieldLabel><Input value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} placeholder="Jan 2022" /></div>
            <div>
              <FieldLabel>End Date</FieldLabel>
              <div className="flex items-center gap-2">
                <Input value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} placeholder="Present" disabled={exp.current} />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <input type="checkbox" checked={exp.current} onChange={e => updateExp(exp.id, 'current', e.target.checked)} className="rounded" />
                  Current
                </label>
              </div>
            </div>
          </div>
          <div>
            <FieldLabel>Brief Description (for AI)</FieldLabel>
            <Input value={exp.description} onChange={e => updateExp(exp.id, 'description', e.target.value)} placeholder="Led frontend development for the payments team..." />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel>Bullet Points</FieldLabel>
              <Button variant="outline" size="sm" className="h-6 text-[11px]" onClick={() => handleGenerateBullets(exp)} disabled={aiLoading !== null || (!exp.title && !exp.description)}>
                {aiLoading === `bullets-${exp.id}` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                AI Generate
              </Button>
            </div>
            {exp.bullets.map((bullet, bi) => (
              <div key={bi} className="flex gap-2 mb-2">
                <span className="text-muted-foreground text-xs mt-2.5">•</span>
                <Input
                  value={bullet}
                  onChange={e => {
                    const newBullets = [...exp.bullets];
                    newBullets[bi] = e.target.value;
                    updateExp(exp.id, 'bullets', newBullets);
                  }}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => {
                  updateExp(exp.id, 'bullets', exp.bullets.filter((_, i) => i !== bi));
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => updateExp(exp.id, 'bullets', [...exp.bullets, ''])}>
              <Plus className="h-3 w-3 mr-1" /> Add Bullet
            </Button>
          </div>
        </div>
      ))}

      {resumeData.experience.length > 0 && (
        <Button variant="outline" size="sm" onClick={addExp}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Another Position</Button>
      )}
    </div>
  );
}

function EducationStep({ resumeData, setResumeData }: StepProps) {
  const addEdu = () => {
    const newEdu: Education = { id: generateId(), degree: '', school: '', year: '', gpa: '', honors: '' };
    setResumeData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEdu = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  };

  const removeEdu = (id: string) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl">Education</h2>
      <p className="text-sm text-muted-foreground">Your academic background.</p>

      {resumeData.education.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm mb-3">No education added yet</p>
          <Button variant="outline" size="sm" onClick={addEdu}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Education</Button>
        </div>
      )}

      {resumeData.education.map((edu, idx) => (
        <div key={edu.id} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Education {idx + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeEdu(edu.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><FieldLabel>Degree</FieldLabel><Input value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} placeholder="B.S. Computer Science" /></div>
            <div><FieldLabel>School</FieldLabel><Input value={edu.school} onChange={e => updateEdu(edu.id, 'school', e.target.value)} placeholder="Stanford University" /></div>
            <div><FieldLabel>Year</FieldLabel><Input value={edu.year} onChange={e => updateEdu(edu.id, 'year', e.target.value)} placeholder="2020" /></div>
            <div><FieldLabel>GPA (optional)</FieldLabel><Input value={edu.gpa} onChange={e => updateEdu(edu.id, 'gpa', e.target.value)} placeholder="3.8" /></div>
            <div className="sm:col-span-2"><FieldLabel>Honors (optional)</FieldLabel><Input value={edu.honors} onChange={e => updateEdu(edu.id, 'honors', e.target.value)} placeholder="Magna Cum Laude, Dean's List" /></div>
          </div>
        </div>
      ))}

      {resumeData.education.length > 0 && (
        <Button variant="outline" size="sm" onClick={addEdu}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Another</Button>
      )}
    </div>
  );
}

function SkillsStep({ resumeData, setResumeData, aiLoading, setAiLoading }: StepProps) {
  const [skillInput, setSkillInput] = useState<Record<string, string>>({});

  const addSkill = (categoryId: string) => {
    const val = (skillInput[categoryId] || '').trim();
    if (!val) return;
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(c => c.id === categoryId ? { ...c, skills: [...c.skills, val] } : c),
    }));
    setSkillInput(prev => ({ ...prev, [categoryId]: '' }));
  };

  const removeSkill = (categoryId: string, skillIdx: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(c => c.id === categoryId ? { ...c, skills: c.skills.filter((_, i) => i !== skillIdx) } : c),
    }));
  };

  const addCategory = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, { id: generateId(), name: 'New Category', skills: [] }],
    }));
  };

  const handleSuggest = async () => {
    setAiLoading('skills');
    try {
      const result = await suggestSkills({ data: { jobTitle: resumeData.personal.title || 'Software Engineer' } });
      if (result.error) {
        toast.error(result.error);
      } else {
        const suggested = result.skills;
        setResumeData(prev => ({
          ...prev,
          skills: prev.skills.map(c => {
            const key = c.name.toLowerCase();
            const match = Object.entries(suggested).find(([k]) => key.includes(k) || k.includes(key));
            if (match) {
              const newSkills = match[1].filter((s: string) => !c.skills.includes(s));
              return { ...c, skills: [...c.skills, ...newSkills] };
            }
            return c;
          }),
        }));
        toast.success('Skills suggested');
      }
    } catch {
      toast.error('Failed to suggest skills');
    }
    setAiLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl">Skills</h2>
          <p className="text-sm text-muted-foreground">Categorize your technical and soft skills.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSuggest} disabled={aiLoading !== null}>
          {aiLoading === 'skills' ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
          AI Suggest
        </Button>
      </div>

      {resumeData.skills.map(category => (
        <div key={category.id} className="border border-border rounded-lg p-4 space-y-3">
          <Input
            value={category.name}
            onChange={e => setResumeData(prev => ({
              ...prev,
              skills: prev.skills.map(c => c.id === category.id ? { ...c, name: e.target.value } : c),
            }))}
            className="font-medium text-sm border-none p-0 h-auto focus-visible:ring-0"
          />
          <div className="flex flex-wrap gap-1.5">
            {category.skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                {skill}
                <button onClick={() => removeSkill(category.id, i)} className="text-muted-foreground hover:text-destructive">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={skillInput[category.id] || ''}
              onChange={e => setSkillInput(prev => ({ ...prev, [category.id]: e.target.value }))}
              placeholder="Add a skill..."
              className="text-sm"
              onKeyDown={e => e.key === 'Enter' && addSkill(category.id)}
            />
            <Button variant="outline" size="sm" onClick={() => addSkill(category.id)}>Add</Button>
          </div>
        </div>
      ))}

      <Button variant="ghost" size="sm" onClick={addCategory}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Category</Button>
    </div>
  );
}

function ProjectsStep({ resumeData, setResumeData }: StepProps) {
  const addProject = () => {
    const newProj: Project = { id: generateId(), name: '', description: '', techStack: '', link: '' };
    setResumeData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const updateProj = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p),
    }));
  };

  const removeProj = (id: string) => {
    setResumeData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl">Projects</h2>
      <p className="text-sm text-muted-foreground">Showcase your best work.</p>

      {resumeData.projects.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm mb-3">No projects added yet</p>
          <Button variant="outline" size="sm" onClick={addProject}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Project</Button>
        </div>
      )}

      {resumeData.projects.map((proj, idx) => (
        <div key={proj.id} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Project {idx + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeProj(proj.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><FieldLabel>Project Name</FieldLabel><Input value={proj.name} onChange={e => updateProj(proj.id, 'name', e.target.value)} placeholder="E-commerce Platform" /></div>
            <div><FieldLabel>Tech Stack</FieldLabel><Input value={proj.techStack} onChange={e => updateProj(proj.id, 'techStack', e.target.value)} placeholder="React, Node.js, PostgreSQL" /></div>
            <div className="sm:col-span-2"><FieldLabel>Description</FieldLabel><Textarea value={proj.description} onChange={e => updateProj(proj.id, 'description', e.target.value)} placeholder="Built a full-stack marketplace..." rows={3} className="resize-none" /></div>
            <div className="sm:col-span-2"><FieldLabel>Link (optional)</FieldLabel><Input value={proj.link} onChange={e => updateProj(proj.id, 'link', e.target.value)} placeholder="https://github.com/..." /></div>
          </div>
        </div>
      ))}

      {resumeData.projects.length > 0 && (
        <Button variant="outline" size="sm" onClick={addProject}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Another Project</Button>
      )}
    </div>
  );
}
