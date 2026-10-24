import { Type } from "@google/genai";

/* ------------------------------------------------------------------
   The exact JSON shape Gemini must return. Every key below is required,
   so your React components can rely on it and never guess key names.

   Which part of the UI reads what:
     candidate, education, skills, experience,
     projects, certifications  -> parsed resume data (History / details)
     strengths, weaknesses     -> score section notes
     atsScore                  -> placeholder only (real score comes from code later)
     suggestions               -> "Suggested improvements" cards (before/after)
     missingSkills             -> "Skills to learn" cards
     suggestedRoles            -> "Roles that fit your resume" cards
------------------------------------------------------------------- */

const str = { type: Type.STRING };
const int = { type: Type.INTEGER };
const list = (items) => ({ type: Type.ARRAY, items });
const obj = (properties) => ({
  type: Type.OBJECT,
  properties,
  required: Object.keys(properties), // every key is mandatory
});
const level = { type: Type.STRING, enum: ["high", "medium", "low"] };

export const RESUME_ANALYSIS_SCHEMA = obj({
  candidate: obj({
    name: str,
    email: str,
    phone: str,
    currentRole: str,
    targetRole: str,
  }),
  education: list(obj({ degree: str, institution: str, year: str })),
  skills: obj({
    technical: list(str),
    soft: list(str),
  }),
  experience: list(
    obj({
      title: str,
      company: str,
      startDate: str,
      endDate: str,
      bullets: list(str),
    }),
  ),
  projects: list(obj({ name: str, description: str, technologies: list(str) })),
  certifications: list(str),

  strengths: list(str),
  weaknesses: list(str),
  atsScore: int,

  suggestions: list(
    obj({ section: str, severity: level, issue: str, before: str, after: str }),
  ),
  missingSkills: list(obj({ skill: str, priority: level, reason: str })),
  suggestedRoles: list(obj({ title: str, matchPercent: int, reason: str })),
});
