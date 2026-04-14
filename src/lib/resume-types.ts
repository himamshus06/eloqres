export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
  gpa: string;
  honors: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string;
  link: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ResumeScore {
  overall: number;
  impact: number;
  clarity: number;
  ats: number;
  completeness: number;
  suggestions: string[];
}

export type TemplateType = 'classic' | 'modern' | 'minimal';

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  sectionOrder: string[];
}

export const initialResumeData: ResumeData = {
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [
    { id: crypto.randomUUID(), name: 'Languages', skills: [] },
    { id: crypto.randomUUID(), name: 'Frameworks', skills: [] },
    { id: crypto.randomUUID(), name: 'Tools', skills: [] },
  ],
  projects: [],
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects'],
};

export function generateId(): string {
  return crypto.randomUUID();
}
