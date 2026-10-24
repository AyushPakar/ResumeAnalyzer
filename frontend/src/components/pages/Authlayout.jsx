import { useState } from "react";
import Logo from "../pages/Logo";

// Shared frame for the Login and Sign up pages
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  onNavigate,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)]">
      <header className="flex items-center justify-between px-6 py-5">
        <button onClick={() => onNavigate("landing")} aria-label="Back to home">
          <Logo />
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[420px] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <h1 className="font-space text-2xl font-bold text-[var(--ink)]">
            {title}
          </h1>
          <p className="mb-6 mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
          {children}
        </div>
        <p className="mt-5 text-sm text-[var(--muted)]">{footer}</p>
      </main>
    </div>
  );
}

// One labelled input with an error / hint line. Password fields get a Show/Hide toggle.
export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  placeholder,
  autoComplete,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--ink)]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          className={`w-full rounded-[10px] border bg-[var(--paper)] px-3.5 py-2.5 text-[0.9rem] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--good)] ${
            error ? "border-[var(--bad)]" : "border-[var(--border)]"
          } ${isPassword ? "pr-16" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-[var(--muted)]"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-note`} className="mt-1.5 text-xs text-[var(--bad)]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-note`} className="mt-1.5 text-xs text-[var(--muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const SUBMIT_BTN =
  "w-full rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-60";
export const LINK_BTN =
  "font-semibold text-[var(--ink)] underline underline-offset-2";
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
