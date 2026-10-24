// Full class names on purpose: Tailwind only generates classes it can see
// written out, so these maps are safe to use with dynamic values.
const bandOf = (score) => (score >= 70 ? "good" : score >= 40 ? "warn" : "bad");
const SCORE_TEXT = { good: "text-good", warn: "text-warn", bad: "text-bad" };
const SCORE_BAR = {
  good: "bar-fill-good",
  warn: "bar-fill-warn",
  bad: "bar-fill-bad",
};

const IMPORTANCE = {
  high: "badge-bad",
  medium: "badge-warn",
  low: "border border-border text-muted",
};
const STATUS = {
  met: { label: "Met", cls: "badge-good" },
  partial: { label: "Partial", cls: "badge-warn" },
  missing: { label: "Missing", cls: "badge-bad" },
};

// Highlights placeholders like [X%] so the user knows to fill in a real number
function Highlight({ text }) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="rounded bg-warn-bg px-1 font-semibold text-warn">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function SectionTitle({ children, count }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h3 className="font-display text-[1.1rem] font-bold text-ink">
        {children}
      </h3>
      {count != null && (
        <span className="text-[0.85rem] text-muted">{count}</span>
      )}
    </div>
  );
}

export default function JobMatchResult({ result }) {
  const band = bandOf(result.matchScore);
  const title = [result.jobTitle, result.company].filter(Boolean).join(" at ");

  return (
    <div className="flex flex-col gap-7">
      {/* Score + summary */}
      <section className="card grid gap-6 p-8 md:grid-cols-[200px_1fr] md:items-center">
        <div>
          <div
            className={`font-display text-5xl font-bold leading-none ${SCORE_TEXT[band]}`}
          >
            {result.matchScore}
            <span className="text-lg font-medium text-muted"> / 100</span>
          </div>
          <div className="bar-track mt-3">
            <div
              className={`bar-fill ${SCORE_BAR[band]}`}
              style={{ width: `${result.matchScore}%` }}
            />
          </div>
        </div>
        <div>
          {title && (
            <h2 className="mb-1 font-display text-xl font-bold text-ink">
              {title}
            </h2>
          )}
          <p className="text-[0.95rem] text-ink-soft">{result.summary}</p>
        </div>
      </section>

      {/* Keywords */}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="card p-6">
          <SectionTitle count={result.matchedKeywords.length}>
            Matched keywords
          </SectionTitle>
          <div className="flex flex-wrap gap-2">
            {result.matchedKeywords.map((k) => (
              <span key={k} className="badge badge-good">
                {k}
              </span>
            ))}
            {result.matchedKeywords.length === 0 && (
              <p className="text-[0.85rem] text-muted">
                No matching keywords found.
              </p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <SectionTitle count={result.missingKeywords.length}>
            Missing keywords
          </SectionTitle>
          <ul className="flex flex-col gap-3">
            {result.missingKeywords.map((m) => (
              <li key={m.keyword}>
                <div className="flex items-center gap-2">
                  <span className="text-[0.9rem] font-semibold text-ink">
                    {m.keyword}
                  </span>
                  <span className={`badge ${IMPORTANCE[m.importance]}`}>
                    {m.importance}
                  </span>
                </div>
                <p className="text-[0.82rem] text-muted">{m.suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Requirements */}
      <section className="card p-6">
        <SectionTitle>Key requirements</SectionTitle>
        <ul className="divide-y divide-border">
          {result.requirements.map((r) => (
            <li key={r.requirement} className="flex items-start gap-3 py-3">
              <span className={`badge mt-0.5 shrink-0 ${STATUS[r.status].cls}`}>
                {STATUS[r.status].label}
              </span>
              <div>
                <p className="text-[0.9rem] text-ink">{r.requirement}</p>
                {r.evidence && (
                  <p className="text-[0.82rem] text-muted">{r.evidence}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Tailored rewrites */}
      {result.tailoredSuggestions.length > 0 && (
        <section>
          <SectionTitle count={result.tailoredSuggestions.length}>
            Tailor your resume to this job
          </SectionTitle>
          <div className="flex flex-col gap-3">
            {result.tailoredSuggestions.map((s, i) => (
              <div key={i} className="card p-5">
                <p className="mb-3 text-[0.85rem] text-muted">
                  <span className="font-semibold text-ink">{s.section}.</span>{" "}
                  {s.reason}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="compare-before rounded-[10px] p-3 text-[0.85rem]">
                    <span className="mb-1.5 block text-[0.7rem] font-bold uppercase tracking-wide text-bad">
                      Before
                    </span>
                    {s.before || "(new content)"}
                  </div>
                  <div className="compare-after rounded-[10px] p-3 text-[0.85rem]">
                    <span className="mb-1.5 block text-[0.7rem] font-bold uppercase tracking-wide text-good">
                      After
                    </span>
                    <Highlight text={s.after} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
