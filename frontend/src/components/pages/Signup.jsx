import { useState } from "react";
import AuthLayout, {
  Field,
  SUBMIT_BTN,
  LINK_BTN,
  EMAIL_RE,
} from "./AuthLayout";
import { registerUser } from "../../api/authApi";

export default function Signup({ onNavigate, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setFormError("");
  };

  function validate() {
    const found = {};
    if (form.name.trim().length < 2) found.name = "Enter your full name.";
    if (!form.email.trim()) found.email = "Enter your email.";
    else if (!EMAIL_RE.test(form.email.trim()))
      found.email = "Enter a valid email address.";
    if (form.password.length < 8) found.password = "Use at least 8 characters.";
    if (form.confirm !== form.password)
      found.confirm = "Passwords don’t match.";
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFormError("");
    try {
      const user = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      onSuccess?.(user);
    } catch (err) {
      // 409 = email already registered: show it under the email field
      if (err.status === 409) setErrors({ email: err.message });
      else setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Analyze your resume and track your progress."
      onNavigate={onNavigate}
      footer={
        <>
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")} className={LINK_BTN}>
            Log in
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Aditi Kapoor"
          value={form.name}
          onChange={update("name")}
          error={errors.name}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          hint="Use at least 8 characters."
        />
        <Field
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={form.confirm}
          onChange={update("confirm")}
          error={errors.confirm}
        />

        {formError && (
          <p
            role="alert"
            className="rounded-lg bg-[var(--bad-bg)] px-3 py-2 text-sm text-[var(--bad)]"
          >
            {formError}
          </p>
        )}

        <button type="submit" disabled={submitting} className={SUBMIT_BTN}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
