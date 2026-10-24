import { useState } from "react";
import { Field } from "../pages/Authlayout";
import { deleteAccount, logout } from "../../api/settingsApi";

export default function DangerZone({ onDeleted, onLogout }) {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      onLogout?.();
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError(error.message || "Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  function cancel() {
    setConfirming(false);
    setPassword("");
    setFieldError("");
    setFormError("");
  }

  async function handleDelete(e) {
    e.preventDefault();

    if (!password) {
      setFieldError("Enter your password to confirm.");
      return;
    }

    setDeleting(true);
    setFieldError("");
    setFormError("");

    try {
      await deleteAccount(password);
      onDeleted?.();
      navigate("/", { replace: true });
    } catch (err) {
      if (err.status === 403 || err.status === 400) {
        setFieldError(err.message);
      } else {
        setFormError(err.message || "Unable to delete your account.");
      }
      setDeleting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--bad)] bg-[var(--card)] p-7">
      <h2 className="font-space text-[1.1rem] font-bold text-[var(--bad)]">
        Danger zone
      </h2>

      <p className="mb-5 mt-0.5 text-[0.86rem] text-[var(--muted)]">
        These actions can’t be undone.
      </p>

      {/* Logout */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] py-4">
        <div>
          <p className="text-[0.92rem] font-semibold text-[var(--ink)]">
            Log out
          </p>
          <p className="text-[0.82rem] text-[var(--muted)]">
            Sign out of your current account.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut || deleting}
          className="rounded-lg border border-[var(--bad)] bg-[var(--bad)] px-[18px] py-[9px] text-[0.88rem] font-semibold text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>

      {logoutError && (
        <p role="alert" className="mt-3 text-sm text-[var(--bad)]">
          {logoutError}
        </p>
      )}

      {/* Delete Account */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <p className="text-[0.92rem] font-semibold text-[var(--ink)]">
            Delete account
          </p>
          <p className="text-[0.82rem] text-[var(--muted)]">
            Permanently deletes your account and everything saved with it.
          </p>
        </div>

        {!confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={loggingOut || deleting}
            className="rounded-lg border border-[var(--bad)] bg-transparent px-[18px] py-[9px] text-[0.88rem] font-semibold text-[var(--bad)] disabled:opacity-45"
          >
            Delete account
          </button>
        )}
      </div>

      {confirming && (
        <form
          onSubmit={handleDelete}
          noValidate
          className="mt-2 space-y-4 rounded-xl bg-[var(--bad-bg)] p-5"
        >
          <p className="text-sm text-[var(--ink)]">
            To confirm, enter your password. Your account will be deleted right
            away.
          </p>

          <Field
            id="delete-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldError("");
              setFormError("");
            }}
            error={fieldError}
          />

          {formError && (
            <p role="alert" className="text-sm text-[var(--bad)]">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={cancel}
              disabled={deleting}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-[18px] py-[9px] text-[0.88rem] font-semibold text-[var(--ink)] disabled:opacity-45"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={deleting || !password}
              className="rounded-lg border border-[var(--bad)] bg-[var(--bad)] px-[18px] py-[9px] text-[0.88rem] font-semibold text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {deleting ? "Deleting…" : "Permanently delete"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
