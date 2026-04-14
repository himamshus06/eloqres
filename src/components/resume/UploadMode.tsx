import { useState } from 'react';
import type { ResumeData, ResumeScore } from '@/lib/resume-types';
import { generateId } from '@/lib/resume-types';
import { scoreResume, parseResumeText } from '@/lib/resume-ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadModeProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onSwitchToBuild: () => void;
}

export function UploadMode({ setResumeData, onSwitchToBuild }: UploadModeProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<ResumeScore | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please paste your resume first');
      return;
    }
    setLoading(true);
    try {
      const [scoreResult, parseResult] = await Promise.all([
        scoreResume({ data: { resumeText: text } }),
        parseResumeText({ data: { text } }),
      ]);

      if (scoreResult.error) {
        toast.error(scoreResult.error);
      } else if (scoreResult.score) {
        setScore(scoreResult.score as ResumeScore);
      }

      if (!parseResult.error && parseResult.parsed) {
        const parsed = parseResult.parsed as Record<string, unknown>;
        setResumeData(prev => ({
          ...prev,
          personal: { ...prev.personal, ...(parsed.personal as object || {}) },
          summary: (parsed.summary as string) || prev.summary,
          experience: Array.isArray(parsed.experience)
            ? parsed.experience.map((e: Record<string, unknown>) => ({ ...e, id: generateId() })) as ResumeData['experience']
            : prev.experience,
          education: Array.isArray(parsed.education)
            ? parsed.education.map((e: Record<string, unknown>) => ({ ...e, id: generateId() })) as ResumeData['education']
            : prev.education,
          skills: Array.isArray(parsed.skills)
            ? parsed.skills.map((c: Record<string, unknown>) => ({ ...c, id: generateId() })) as ResumeData['skills']
            : prev.skills,
          projects: Array.isArray(parsed.projects)
            ? parsed.projects.map((p: Record<string, unknown>) => ({ ...p, id: generateId() })) as ResumeData['projects']
            : prev.projects,
        }));
        toast.success('Resume parsed successfully');
      }
    } catch {
      toast.error('Analysis failed');
    }
    setLoading(false);
  };

  const getScoreColor = (val: number) => {
    if (val >= 80) return '#059669';
    if (val >= 60) return '#D97706';
    return '#DC2626';
  };

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="font-heading text-2xl mb-1">Upload & Improve</h2>
        <p className="text-sm text-muted-foreground">Paste your existing resume text below for AI analysis.</p>
      </div>

      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste your resume text here..."
        rows={12}
        className="resize-none font-mono text-xs"
      />

      <Button onClick={handleAnalyze} disabled={loading || !text.trim()} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Analyze Resume
      </Button>

      {/* Score Display */}
      {score && (
        <div className="border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-[3px]"
              style={{ borderColor: getScoreColor(score.overall), color: getScoreColor(score.overall) }}
            >
              {score.overall}
            </div>
            <div>
              <p className="font-semibold text-sm">Overall Score</p>
              <p className="text-xs text-muted-foreground">
                {score.overall >= 80 ? 'Excellent resume!' : score.overall >= 60 ? 'Good, but room to improve' : 'Needs significant work'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Impact', value: score.impact },
              { label: 'Clarity', value: score.clarity },
              { label: 'ATS Ready', value: score.ats },
              { label: 'Completeness', value: score.completeness },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span style={{ color: getScoreColor(item.value) }}>{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.value}%`, backgroundColor: getScoreColor(item.value) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {score.suggestions && score.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2">Suggestions</p>
              <ul className="space-y-1.5">
                {score.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    {i < 2 ? <CheckCircle className="h-3.5 w-3.5 shrink-0 text-chart-2 mt-0.5" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-chart-1 mt-0.5" />}
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onSwitchToBuild}>
            Edit in Builder <ArrowRight className="h-3.5 w-3.5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
