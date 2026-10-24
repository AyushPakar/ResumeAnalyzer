import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------
   Static sample visuals. All numbers are illustrative, not real data.
------------------------------------------------------------------- */

const CARD = "rounded-2xl border border-[var(--border)] bg-[var(--card)]";
const BAR = {
  good: "bg-[var(--good)]",
  warn: "bg-[var(--warn)]",
  bad: "bg-[var(--bad)]",
};
const PRIORITY = {
  high: "bg-[var(--bad-bg)] text-[var(--bad)]",
  medium: "bg-[var(--warn-bg)] text-[var(--warn)]",
};

function Bar({ label, value, band, suffix = "" }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-xs">
        <span className="truncate font-semibold text-[var(--ink)]">
          {label}
        </span>
        <span className="font-bold tabular-nums text-[var(--ink)]">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--paper)] ring-1 ring-inset ring-[var(--border)]">
        <div
          className={`h-full rounded-full ${BAR[band]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ScoreVisual() {
  const r = 52;
  const c = 2 * Math.PI * r;
  const score = 82;
  return (
    <div className={`${CARD} p-6`}>
      <div className="flex items-center gap-5">
        <div className="relative h-[130px] w-[130px] shrink-0">
          <svg
            viewBox="0 0 130 130"
            className="h-full w-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="65"
              cy="65"
              r={r}
              fill="none"
              stroke="var(--border)"
              strokeWidth="11"
            />
            <circle
              cx="65"
              cy="65"
              r={r}
              fill="none"
              stroke="var(--good)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - score / 100)}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-space text-4xl font-bold leading-none text-[var(--ink)]">
                {score}
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">/ 100</div>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <Bar label="Formatting" value={92} band="good" />
          <Bar label="Keyword match" value={61} band="warn" />
          <Bar label="Section completeness" value={88} band="good" />
          <Bar label="Quantified impact" value={44} band="bad" />
        </div>
      </div>
      <span className="mt-5 inline-block rounded-full bg-[var(--good-bg)] px-3.5 py-1.5 text-xs font-semibold text-[var(--good)]">
        Good — a few fixes away
      </span>
    </div>
  );
}

function SuggestionsVisual() {
  return (
    <div className="space-y-3">
      <div className={`${CARD} p-5`}>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-[var(--bad-bg)] px-2.5 py-0.5 text-[0.7rem] font-bold text-[var(--bad)]">
            High impact
          </span>
          <span className="text-sm font-semibold text-[var(--ink)]">
            Bullet lacks a measurable result
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-[10px] bg-[var(--bad-bg)] p-3 text-[0.82rem] text-[var(--ink-soft)]">
            <span className="mb-1 block text-[0.66rem] font-bold uppercase tracking-wide text-[var(--bad)]">
              Before
            </span>
            Responsible for managing the team’s sprint planning.
          </div>
          <div className="rounded-[10px] bg-[var(--good-bg)] p-3 text-[0.82rem] text-[var(--ink-soft)]">
            <span className="mb-1 block text-[0.66rem] font-bold uppercase tracking-wide text-[var(--good)]">
              After
            </span>
            Led sprint planning for a 6-person team, cutting cycle time by{" "}
            <mark className="rounded bg-[var(--warn-bg)] px-1 font-semibold text-[var(--warn)]">
              [X%]
            </mark>
            .
          </div>
        </div>
      </div>
      <div className={`${CARD} p-5`}>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-[var(--warn-bg)] px-2.5 py-0.5 text-[0.7rem] font-bold text-[var(--warn)]">
            Medium impact
          </span>
          <span className="text-sm font-semibold text-[var(--ink)]">
            Missing keywords
          </span>
        </div>
        <p className="text-[0.82rem] text-[var(--ink-soft)]">
          Add “TypeScript” and “component architecture”. Both appear in the job
          description but not in your resume.
        </p>
      </div>
    </div>
  );
}

function RolesVisual() {
  return (
    <div className={`${CARD} p-6`}>
      <p className="mb-3.5 text-sm font-bold text-[var(--ink)]">
        Roles that fit your resume
      </p>
      <div className="space-y-3.5">
        <Bar label="Frontend Engineer" value={89} band="good" suffix="%" />
        <Bar label="Product Analyst" value={74} band="good" suffix="%" />
        <Bar
          label="Junior Full-Stack Developer"
          value={68}
          band="warn"
          suffix="%"
        />
      </div>
      <p className="mb-2.5 mt-6 text-sm font-bold text-[var(--ink)]">
        Skills to learn
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          ["TypeScript", "high"],
          ["Jest", "medium"],
          ["System design", "medium"],
        ].map(([skill, priority]) => (
          <span
            key={skill}
            className={`rounded-full px-3 py-1 text-xs font-bold ${PRIORITY[priority]}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function HistoryVisual() {
  const rows = [
    ["Resume v4", 82, "↑ 6"],
    ["Resume v3", 76, "↑ 9"],
    ["Resume v2", 67, "↑ 5"],
  ];
  return (
    <div className={`${CARD} p-6`}>
      <p className="mb-1 text-sm font-bold text-[var(--ink)]">
        Score over time
      </p>
      <svg
        viewBox="0 0 300 110"
        className="w-full"
        role="img"
        aria-label="Sample chart: score rising across four versions"
      >
        <line x1="10" y1="95" x2="290" y2="95" stroke="var(--border)" />
        <polygon
          points="20,78 100,69 200,53 280,42 280,95 20,95"
          fill="var(--good)"
          opacity=".1"
        />
        <polyline
          points="20,78 100,69 200,53 280,42"
          fill="none"
          stroke="var(--good)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[
          [20, 78],
          [100, 69],
          [200, 53],
          [280, 42],
        ].map(([x, y]) => (
          <circle
            key={x}
            cx={x}
            cy={y}
            r="4.5"
            fill="var(--card)"
            stroke="var(--good)"
            strokeWidth="2.5"
          />
        ))}
      </svg>
      <ul className="mt-3 divide-y divide-[var(--border)]">
        {rows.map(([name, score, trend]) => (
          <li
            key={name}
            className="flex items-center justify-between py-2.5 text-sm"
          >
            <span className="text-[var(--ink)]">{name}</span>
            <span>
              <span className="font-space text-base font-bold text-[var(--good)]">
                {score}
              </span>
              <span className="ml-2 text-xs font-semibold text-[var(--good)]">
                {trend}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------
   Slides
------------------------------------------------------------------- */

const SLIDES = [
  {
    id: "score",
    tag: "AI resume analyzer",
    title: "Get your resume past the ATS and in front of recruiters",
    text: "Upload your resume and get an ATS score, a clear list of what to fix and the skills to learn next, all in one place.",
    points: [
      "Upload a PDF or DOCX up to 5 MB",
      "See your score, strengths and weaknesses",
      "Every analysis is saved to your history",
    ],
    visual: <ScoreVisual />,
    cta: true,
  },
  {
    id: "suggestions",
    tag: "Smart suggestions",
    title: "Fix weak bullet points with before and after rewrites",
    text: "Each suggestion points to the exact line in your resume and shows a stronger version. Where a number would help, you’re asked to add your real figure, so nothing is made up.",
    points: [
      "Ranked by impact, most important first",
      "Placeholders for your real metrics",
      "Missing keywords called out",
    ],
    visual: <SuggestionsVisual />,
  },
  {
    id: "roles",
    tag: "Skills and roles",
    title: "See which roles fit you and what to learn next",
    text: "Get role matches with the reasons behind them, plus the skills your target role usually expects that your resume doesn’t show yet. Paste a job description to compare against a specific listing.",
    points: [
      "Match percentage for each role",
      "Skills to learn, ranked by priority",
      "Check your fit against any job description",
    ],
    visual: <RolesVisual />,
  },
  {
    id: "history",
    tag: "Track progress",
    title: "Watch your score improve with every version",
    text: "Every upload is saved, so you can see how your score changes from one version to the next and keep improving.",
    points: [
      "Trend arrows between versions",
      "Search and filter past analyses",
      "Delete any resume whenever you like",
    ],
    visual: <HistoryVisual />,
  },
];

/* ------------------------------------------------------------------
   Carousel
------------------------------------------------------------------- */

export default function HeroCarousel({ onNavigate, onLearnMore }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const count = SLIDES.length;

  const go = useCallback(
    (i) => setIndex(((i % count) + count) % count),
    [count],
  );

  // Auto-advance, unless the visitor is interacting or prefers reduced motion
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(timer);
  }, [paused, count]);

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Product highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="focus:outline-none"
    >
      <div
        className="overflow-hidden"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((slide, i) => {
            const active = i === index;
            const Title = i === 0 ? "h1" : "h2";
            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!active}
                className="w-full shrink-0"
              >
                <div className="grid items-center gap-10 px-1 py-8 md:grid-cols-[1.05fr_1fr] md:px-2 md:py-14">
                  <div>
                    <span className="inline-block rounded-full bg-[var(--good-bg)] px-3 py-1 text-xs font-bold text-[var(--good)]">
                      {slide.tag}
                    </span>
                    <Title className="font-space mt-4 text-[2rem] font-bold leading-tight text-[var(--ink)] md:text-[2.6rem]">
                      {slide.title}
                    </Title>
                    <p className="mt-4 max-w-[52ch] text-[1.02rem] text-[var(--muted)]">
                      {slide.text}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {slide.points.map((p) => (
                        <li
                          key={p}
                          className="flex items-start gap-2.5 text-[0.95rem] text-[var(--ink-soft)]"
                        >
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--good-bg)] text-[var(--good)]">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    {slide.cta && (
                      <div className="mt-7 flex flex-wrap gap-3">
                        <button
                          tabIndex={active ? 0 : -1}
                          onClick={() => onNavigate("signup")}
                          className="rounded-lg bg-[var(--ink)] px-5 py-2.5 text-[0.92rem] font-semibold text-[var(--paper)]"
                        >
                          Get started
                        </button>
                        <button
                          tabIndex={active ? 0 : -1}
                          onClick={onLearnMore}
                          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-[0.92rem] font-semibold text-[var(--ink)]"
                        >
                          See how it works
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mx-auto w-full max-w-[460px]">
                    {slide.visual}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pb-2">
        <button
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--ink)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-[var(--ink)]" : "w-2 bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--ink)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        Sample data shown for illustration.
      </p>
    </div>
  );
}
