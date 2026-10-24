import { useState } from "react";
import AuthLayout, {
  Field,
  SUBMIT_BTN,
  LINK_BTN,
  EMAIL_RE,
} from "./AuthLayout";
import { loginUser } from "../../api/authApi";

export default function Login({ onNavigate, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined })); // clear the error as they type
    setFormError("");
  };

  function validate() {
    const found = {};
    if (!form.email.trim()) found.email = "Enter your email.";
    else if (!EMAIL_RE.test(form.email.trim()))
      found.email = "Enter a valid email address.";
    if (!form.password) found.password = "Enter your password.";
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
      const user = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });
      onSuccess?.(user);
    } catch (err) {
      setFormError(err.message); // e.g. "Invalid email or password."
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your resumes and scores."
      onNavigate={onNavigate}
      footer={
        <>
          Don’t have an account?{" "}
          <button onClick={() => onNavigate("signup")} className={LINK_BTN}>
            Sign up
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
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
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
