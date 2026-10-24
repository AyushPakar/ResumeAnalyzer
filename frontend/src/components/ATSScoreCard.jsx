import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getResume } from "../api/ResumeAPI.js";

const BREAKDOWN_ITEMS = [
  { key: "formatting", label: "Formatting" },
  { key: "keywordMatch", label: "Keyword match" },
  { key: "sectionCompleteness", label: "Section completeness" },
  { key: "quantifiedImpact", label: "Quantified impact" },
];

// One function decides the colour band, so the gauge, bars and label always
// agree: 70+ good, 40-69 warn, below 40 bad (same as the palette guide).
function bandOf(score) {
  if (score >= 70) return "good";
  if (score >= 40) return "warn";
  return "bad";
}

// Full class names so Tailwind can see them
const BAND = {
  good: {
    text: "text-[var(--good)]",
    bg: "bg-[var(--good-bg)]",
    bar: "bg-[var(--good)]",
    stroke: "var(--good)",
  },
  warn: {
    text: "text-[var(--warn)]",
    bg: "bg-[var(--warn-bg)]",
    bar: "bg-[var(--warn)]",
    stroke: "var(--warn)",
  },
  bad: {
    text: "text-[var(--bad)]",
    bg: "bg-[var(--bad-bg)]",
    bar: "bg-[var(--bad)]",
    stroke: "var(--bad)",
  },
};

const PRIORITY = {
  high: "bg-[var(--bad-bg)] text-[var(--bad)]",
  medium: "bg-[var(--warn-bg)] text-[var(--warn)]",
  low: "bg-[var(--paper)] text-[var(--muted)]",
};

function getScoreLabel(score) {
  if (score >= 85) return "Excellent — looking strong";
  if (score >= 70) return "Good — a few fixes away";
  if (score >= 50) return "Fair — room to improve";
  return "Needs improvement";
}

function NoteList({ title, items = [], dot }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[var(--ink)]">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-[var(--ink-soft)]">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ATSScoreCard({ resumeId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const resume = await getResume(resumeId);
      if (resume.status !== "completed" || !resume.analysis) {
        throw new Error("This resume hasn't finished analyzing yet.");
      }
      setAnalysis(resume.analysis);
    } catch (err) {
      setAnalysis(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    if (!resumeId) {
      // File removed: reset instead of showing a stale score
      setAnalysis(null);
      setError("");
      return;
    }
    fetchAnalysis();
  }, [resumeId, fetchAnalysis]);

  // No resume yet is a normal state, not an error
  if (!resumeId) {
    return (
      <section className="card flex min-h-40 items-center justify-center">
        <p className="text-sm text-[var(--muted)]">
          Upload a resume to see its ATS score here.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-[var(--bad)]" />
          <div className="flex-1">
            <p className="text-sm text-[var(--bad)]">{error}</p>
            <button
              onClick={fetchAnalysis}
              className="mt-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper)]"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (loading || !analysis) {
    return (
      <section className="card flex min-h-64 items-center justify-center">
        <RefreshCw className="mr-3 h-5 w-5 animate-spin text-[var(--good)]" />
        <span className="text-sm text-[var(--muted)]">
          Loading ATS analysis...
        </span>
      </section>
    );
  }

  const score = Math.max(0, Math.min(100, Number(analysis.atsScore ?? 0)));
  const band = BAND[bandOf(score)];

  // The four bars only appear once the backend sends atsBreakdown
  const breakdown = analysis.atsBreakdown;
  const hasBreakdown = breakdown && Object.keys(breakdown).length > 0;

  const missingSkills = analysis.missingSkills ?? [];

  const radius = 92;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-5 mb-6">
      <section className="card w-full p-4">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[250px_1fr]">
          {/* Circular ATS score */}
          <div className="flex flex-col items-center">
            <div className="relative h-[220px] w-[220px]">
              <svg
                viewBox="0 0 220 220"
                className="h-full w-full -rotate-90"
                aria-label={`ATS score: ${score} out of 100`}
                role="img"
              >
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="17"
                />
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke={band.stroke}
                  strokeWidth="17"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - score / 100)}
                  className="transition-[stroke-dashoffset] duration-700"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-space text-5xl font-bold text-[var(--ink)]">
                  {score}
                </span>
                <span className="mt-1 text-sm text-[var(--muted)]">/ 100</span>
              </div>
            </div>

            <span
              className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold ${band.bg} ${band.text}`}
            >
              {getScoreLabel(score)}
            </span>
          </div>

          {/* Right side: score bars if available, otherwise strengths and weaknesses */}
          {hasBreakdown ? (
            <div className="space-y-5">
              {BREAKDOWN_ITEMS.map((item) => {
                const value = Math.max(
                  0,
                  Math.min(100, Number(breakdown[item.key] ?? 0)),
                );
                return (
                  <div
                    key={item.key}
                    className="grid grid-cols-[minmax(110px,1fr)_minmax(80px,1fr)_36px] items-center gap-4"
                  >
                    <span className="text-sm font-semibold leading-5 text-[var(--ink)] sm:text-base">
                      {item.label}
                    </span>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--paper)] ring-1 ring-inset ring-[var(--border)]">
                      <div
                        className={`h-full rounded-full transition-[width] duration-700 ${BAND[bandOf(value)].bar}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-right text-sm font-bold tabular-nums text-[var(--ink)] sm:text-base">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-5">
              <NoteList
                title="Strengths"
                items={analysis.strengths}
                dot="bg-[var(--good)]"
              />
              <NoteList
                title="Weaknesses"
                items={analysis.weaknesses}
                dot="bg-[var(--warn)]"
              />
            </div>
          )}
        </div>
      </section>

      {/* Skills to improve */}
      <section className="card p-4">
        <h2 className="font-space text-lg font-bold text-[var(--ink)]">
          Skills to improve
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Skills commonly expected for your target role that your resume doesn't
          show yet.
        </p>

        {missingSkills.length > 0 ? (
          <ul className="mt-4">
            {missingSkills.map((s) => (
              <li
                key={s.skill}
                className="flex items-start gap-3 border-b border-[var(--border)] py-3 last:border-0"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${PRIORITY[s.priority] ?? PRIORITY.low}`}
                >
                  {s.priority}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {s.skill}
                  </p>
                  {s.reason && (
                    <p className="text-sm text-[var(--muted)]">{s.reason}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No missing skills were reported in this analysis.
          </p>
        )}
      </section>
    </div>
  );
}
