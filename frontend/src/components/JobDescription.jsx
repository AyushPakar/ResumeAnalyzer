import { useState } from "react";
import { matchJob } from "../api/ResumeAPI.js";

const MIN_CHARS = 50;

export default function JobDescriptionCard({ resumeId, onResult }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tooShort = text.trim().length < MIN_CHARS;
  const disabled = !resumeId || tooShort || loading;

  let hint = "";
  if (!resumeId) hint = "Upload a resume first to enable this.";
  else if (tooShort)
    hint = `Paste at least ${MIN_CHARS} characters of the job listing.`;

  async function handleCompare() {
    setLoading(true);
    setError("");
    try {
      onResult(await matchJob(resumeId, text));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card flex flex-col gap-3 p-7">
      <h3 className="font-display text-[1.05rem] font-bold text-ink">
        Target job
      </h3>
      <p className="text-[0.85rem] text-muted">
        Paste a job listing to score your resume against this specific role
        instead of a general profile.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Frontend Engineer, React, TypeScript, 2+ years experience..."
        rows={6}
        className="resize-none rounded-[10px] border border-border bg-paper px-3.5 py-3 text-[0.85rem] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-good"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handleCompare}
          disabled={disabled}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Comparing…" : "Compare with resume"}
        </button>
        {hint && <span className="text-[0.8rem] text-muted">{hint}</span>}
      </div>

      {error && (
        <p className="rounded-lg bg-bad-bg px-3 py-2 text-[0.85rem] text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
