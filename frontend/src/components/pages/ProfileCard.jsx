import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Field, EMAIL_RE } from "../pages/Authlayout";
import { getProfile, updateProfile } from "../../api/settingsApi";

const EXPERIENCE = [
  { value: "", label: "Select your level" },
  { value: "fresher", label: "Student / Fresher" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5+", label: "5+ years" },
];

const CARD = "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7";
const INPUT =
  "w-full rounded-[10px] border border-[var(--border)] bg-[var(--paper)] px-3.5 py-2.5 text-[0.9rem] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--good)]";

const toForm = (p) => ({
  name: p.name ?? "",
  email: p.email ?? "",
  targetRole: p.targetRole ?? "",
  experienceLevel: p.experienceLevel ?? "",
});

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase() || "?";
}

export default function ProfileCard({ onUpdated }) {
  const [saved, setSaved] = useState(null); // what the server has right now
  const [form, setForm] = useState(null); // what's in the inputs
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const profile = await getProfile();
      setSaved(toForm(profile));
      setForm(toForm(profile));
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setFormError("");
    setJustSaved(false);
  };

  function validate() {
    const found = {};
    if (form.name.trim().length < 2) found.name = "Enter your full name.";
    if (!form.email.trim()) found.email = "Enter your email.";
    else if (!EMAIL_RE.test(form.email.trim()))
      found.email = "Enter a valid email address.";
    if (form.targetRole.trim().length > 80)
      found.targetRole = "Keep this under 80 characters.";
    return found;
  }

  async function handleSave(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setFormError("");
    try {
      const profile = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        targetRole: form.targetRole.trim(),
        experienceLevel: form.experienceLevel,
      });
      setSaved(toForm(profile));
      setForm(toForm(profile));
      setJustSaved(true);
      onUpdated?.(profile); // lets the navbar initials update right away
    } catch (err) {
      // 409 = email belongs to another account: show it under the email field
      if (err.status === 409) setErrors({ email: err.message });
      else setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm(saved);
    setErrors({});
    setFormError("");
    setJustSaved(false);
  }

  if (loading) {
    return (
      <section className={`${CARD} flex min-h-64 items-center justify-center`}>
        <RefreshCw className="mr-3 h-5 w-5 animate-spin text-[var(--good)]" />
        <span className="text-sm text-[var(--muted)]">
          Loading your profile...
        </span>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className={`${CARD} flex items-start gap-3`}>
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--bad)]" />
        <div>
          <p className="text-sm text-[var(--bad)]">{loadError}</p>
          <button
            onClick={load}
            className="mt-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--ink)]"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  return (
    <section className={CARD}>
      <h2 className="font-space text-[1.1rem] font-bold text-[var(--ink)]">
        Profile
      </h2>
      <p className="mb-5 mt-0.5 text-[0.86rem] text-[var(--muted)]">
        Your personal details and the role you’re aiming for.
      </p>

      <div className="mb-5 flex items-center gap-4">
        <div className="font-space grid h-[60px] w-[60px] place-items-center rounded-full bg-[var(--good-bg)] text-[1.3rem] font-bold text-[var(--good)]">
          {initialsOf(form.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--ink)]">
            {saved.name}
          </p>
          <p className="truncate text-sm text-[var(--muted)]">{saved.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="profile-name"
            label="Full name"
            autoComplete="name"
            value={form.name}
            onChange={update("name")}
            error={errors.name}
          />
          <Field
            id="profile-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            error={errors.email}
          />
          <Field
            id="profile-role"
            label="Target role"
            placeholder="e.g. Frontend Engineer"
            value={form.targetRole}
            onChange={update("targetRole")}
            error={errors.targetRole}
          />
          <div>
            <label
              htmlFor="profile-level"
              className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--ink)]"
            >
              Experience level
            </label>
            <select
              id="profile-level"
              value={form.experienceLevel}
              onChange={update("experienceLevel")}
              className={INPUT}
            >
              {EXPERIENCE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-[var(--bad-bg)] px-3 py-2 text-sm text-[var(--bad)]"
          >
            {formError}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          {justSaved && (
            <span
              role="status"
              className="mr-auto text-sm font-semibold text-[var(--good)]"
            >
              Changes saved.
            </span>
          )}
          <button
            type="button"
            onClick={handleCancel}
            disabled={!dirty || saving}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-[18px] py-[9px] text-[0.88rem] font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!dirty || saving}
            className="rounded-lg border border-[var(--ink)] bg-[var(--ink)] px-[18px] py-[9px] text-[0.88rem] font-semibold text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
