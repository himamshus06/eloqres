import { createServerFn } from '@tanstack/react-start';

const AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error('AI service not configured');

  const response = await fetch(AI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate limited — please wait a moment and try again.');
    if (response.status === 402) throw new Error('AI credits exhausted. Add credits in workspace settings.');
    throw new Error(`AI request failed (${response.status})`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content || '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJSON(text: string): any {
  const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

export const generateBullets = createServerFn({ method: 'POST' })
  .inputValidator((input: { jobTitle: string; description: string }) => input)
  .handler(async ({ data }) => {
    try {
      const result = await callAI(
        'Generate exactly 4 strong resume bullet points for this role. Each bullet MUST start with a powerful action verb and include quantified impact (numbers, percentages, dollar amounts). Return ONLY a JSON array of 4 strings, no markdown fences.',
        `Role: ${data.jobTitle}\nContext: ${data.description}`
      );
      return { bullets: extractJSON(result) as string[], error: null };
    } catch (e) {
      return { bullets: [] as string[], error: e instanceof Error ? e.message : 'Failed' };
    }
  });

export const generateSummary = createServerFn({ method: 'POST' })
  .inputValidator((input: { title: string; years: string; skills: string }) => input)
  .handler(async ({ data }) => {
    try {
      const result = await callAI(
        'Write a compelling 3-sentence professional summary for a resume. Be specific, confident, and highlight key strengths. Return ONLY the summary text, no quotes or formatting.',
        `Title: ${data.title}\nYears of experience: ${data.years}\nKey skills: ${data.skills}`
      );
      return { summary: result.replace(/^["']|["']$/g, '').trim(), error: null };
    } catch (e) {
      return { summary: '', error: e instanceof Error ? e.message : 'Failed' };
    }
  });

export const suggestSkills = createServerFn({ method: 'POST' })
  .inputValidator((input: { jobTitle: string }) => input)
  .handler(async ({ data }) => {
    try {
      const result = await callAI(
        'Suggest relevant technical and soft skills for this role. Return a JSON object with keys "languages", "frameworks", "tools", "soft" — each an array of 4-6 skill strings. No markdown fences.',
        `Role: ${data.jobTitle}`
      );
      return { skills: extractJSON(result) as Record<string, string[]>, error: null };
    } catch (e) {
      return { skills: {} as Record<string, string[]>, error: e instanceof Error ? e.message : 'Failed' };
    }
  });

export const scoreResume = createServerFn({ method: 'POST' })
  .inputValidator((input: { resumeText: string }) => input)
  .handler(async ({ data }) => {
    try {
      const result = await callAI(
        'Analyze this resume and return a JSON object (no markdown fences) with: "overall" (0-100 score), "impact" (0-100, are bullets quantified and action-verb-led?), "clarity" (0-100, concise and jargon-free?), "ats" (0-100, ATS compatible keywords/formatting?), "completeness" (0-100, missing sections?), "suggestions" (array of 4-6 specific actionable improvement strings).',
        data.resumeText
      );
      return { score: extractJSON(result) as Record<string, unknown>, error: null };
    } catch (e) {
      return { score: null, error: e instanceof Error ? e.message : 'Failed' };
    }
  });

export const rewriteSection = createServerFn({ method: 'POST' })
  .inputValidator((input: { text: string; style: string }) => input)
  .handler(async ({ data }) => {
    try {
      const result = await callAI(
        `Rewrite this resume text to be more ${data.style}. Return ONLY the improved text, no quotes or formatting.`,
        data.text
      );
      return { text: result.replace(/^["']|["']$/g, '').trim(), error: null };
    } catch (e) {
      return { text: '', error: e instanceof Error ? e.message : 'Failed' };
    }
  });

export const parseResumeText = createServerFn({ method: 'POST' })
  .inputValidator((input: { text: string }) => input)
  .handler(async ({ data }) => {
    try {
      const result = await callAI(
        `Parse this resume text into structured JSON (no markdown fences). Return: {
  "personal": {"name":"","title":"","email":"","phone":"","location":"","linkedin":"","github":"","website":""},
  "summary": "",
  "experience": [{"company":"","title":"","startDate":"","endDate":"","current":false,"bullets":[],"description":""}],
  "education": [{"degree":"","school":"","year":"","gpa":"","honors":""}],
  "skills": [{"name":"Languages","skills":[]},{"name":"Frameworks","skills":[]},{"name":"Tools","skills":[]}],
  "projects": [{"name":"","description":"","techStack":"","link":""}]
}. Fill in what you can find, leave empty strings for missing data.`,
        data.text
      );
      return { parsed: extractJSON(result), error: null };
    } catch (e) {
      return { parsed: null, error: e instanceof Error ? e.message : 'Failed' };
    }
  });

export const generateCoverLetter = createServerFn({ method: 'POST' })
  .inputValidator((input: { resumeText: string; jobTitle: string; company: string }) => input)
  .handler(async ({ data }) => {
    try {
      const result = await callAI(
        'Write a professional, personalized cover letter (3-4 paragraphs) based on this resume for the given position. Be specific about how the candidate\'s experience matches the role. Return ONLY the letter text.',
        `Resume:\n${data.resumeText}\n\nPosition: ${data.jobTitle} at ${data.company}`
      );
      return { letter: result.trim(), error: null };
    } catch (e) {
      return { letter: '', error: e instanceof Error ? e.message : 'Failed' };
    }
  });

export const tailorToJob = createServerFn({ method: 'POST' })
  .inputValidator((input: { resumeText: string; jobDescription: string }) => input)
  .handler(async ({ data }) => {
    try {
      const result = await callAI(
        'Analyze this resume against the job description. Return JSON (no markdown fences): {"keywords": ["missing keywords to add"], "strengths": ["sections that align well"], "improvements": ["specific suggestions to tailor the resume"], "score": 0-100 match percentage}.',
        `Resume:\n${data.resumeText}\n\nJob Description:\n${data.jobDescription}`
      );
      return { analysis: extractJSON(result), error: null };
    } catch (e) {
      return { analysis: null, error: e instanceof Error ? e.message : 'Failed' };
    }
  });
