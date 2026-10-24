import { Type } from "@google/genai";

/* ------------------------------------------------------------------
   Shape of the "Compare with resume" (job description match) result.

   Which part of the UI reads what:
     jobTitle, company, matchScore, summary -> result header + score bar
     matchedKeywords                        -> green keyword chips
     missingKeywords                        -> keywords to add / learn
     requirements                           -> met / partial / missing checklist
     tailoredSuggestions                    -> before/after rewrites for this job
------------------------------------------------------------------- */

const str = { type: Type.STRING };
const int = { type: Type.INTEGER };
const list = (items) => ({ type: Type.ARRAY, items });
const obj = (properties) => ({
  type: Type.OBJECT,
  properties,
  required: Object.keys(properties),
});
const level = { type: Type.STRING, enum: ["high", "medium", "low"] };
const status = { type: Type.STRING, enum: ["met", "partial", "missing"] };

export const JOB_MATCH_SCHEMA = obj({
  jobTitle: str,
  company: str,
  matchScore: int,
  summary: str,
  matchedKeywords: list(str),
  missingKeywords: list(
    obj({ keyword: str, importance: level, suggestion: str }),
  ),
  requirements: list(obj({ requirement: str, status, evidence: str })),
  tailoredSuggestions: list(
    obj({ section: str, before: str, after: str, reason: str }),
  ),
});
