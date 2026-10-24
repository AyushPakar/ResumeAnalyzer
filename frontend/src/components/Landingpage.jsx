import Logo from "./pages/Logo";
import HeroCarousel from "./Herocarousel";

const STEPS = [
  {
    n: "1",
    title: "Upload your resume",
    text: "Drop in a PDF or DOCX file up to 5 MB. It’s saved and analyzed automatically.",
  },
  {
    n: "2",
    title: "Read your analysis",
    text: "Get an ATS score, strengths, weaknesses, missing skills and suggested roles.",
  },
  {
    n: "3",
    title: "Improve and compare",
    text: "Apply the suggestions, paste a job description to check your fit, then upload a new version to see your progress.",
  },
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 py-3.5 md:px-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="ResumeScope home"
        >
          <Logo />
        </button>

        <div className="hidden gap-7 text-[0.92rem] font-medium text-[var(--muted)] md:flex">
          <button
            onClick={() => scrollToId("hero")}
            className="hover:text-[var(--ink)]"
          >
            Features
          </button>
          <button
            onClick={() => scrollToId("how")}
            className="hover:text-[var(--ink)]"
          >
            How it works
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate("login")}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[0.88rem] font-semibold text-[var(--ink)]"
          >
            Log in
          </button>
          <button
            onClick={() => onNavigate("signup")}
            className="rounded-lg border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-[0.88rem] font-semibold text-[var(--paper)]"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="hero"
        className="bg-[radial-gradient(60%_55%_at_75%_0%,var(--good-bg),transparent)]"
      >
        <div className="mx-auto max-w-[1080px] px-5 md:px-6">
          <HeroCarousel
            onNavigate={onNavigate}
            onLearnMore={() => scrollToId("how")}
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-[1080px] px-5 py-20 md:px-6">
        <h2 className="font-space text-center text-[1.9rem] font-bold text-[var(--ink)]">
          How it works
        </h2>
        <p className="mx-auto mt-2 max-w-[48ch] text-center text-[var(--muted)]">
          Three steps from a raw resume to a clear plan.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
            >
              <span className="font-space grid h-9 w-9 place-items-center rounded-full bg-[var(--good-bg)] text-base font-bold text-[var(--good)]">
                {s.n}
              </span>
              <h3 className="font-space mt-4 text-lg font-bold text-[var(--ink)]">
                {s.title}
              </h3>
              <p className="mt-1.5 text-[0.92rem] text-[var(--muted)]">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-[1080px] px-5 pb-20 md:px-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
          <h2 className="font-space text-[1.7rem] font-bold text-[var(--ink)]">
            Ready to see your score?
          </h2>
          <p className="mx-auto mt-2 max-w-[46ch] text-[var(--muted)]">
            Create an account and analyze your first resume in a few minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate("signup")}
              className="rounded-lg bg-[var(--ink)] px-5 py-2.5 text-[0.92rem] font-semibold text-[var(--paper)]"
            >
              Create an account
            </button>
            <button
              onClick={() => onNavigate("login")}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-[0.92rem] font-semibold text-[var(--ink)]"
            >
              Log in
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-sm text-[var(--muted)]">
        ResumeScope · A college project · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
