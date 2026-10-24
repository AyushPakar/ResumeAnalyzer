import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  listHistory,
  retryResume,
  deleteResume,
} from "../../api/historyAPI.js";

/* ------------------------------------------------------------------
   Constants and small helpers
------------------------------------------------------------------- */

const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "processing", label: "Processing" },
  { key: "failed", label: "Failed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "score", label: "Highest score" },
];

// Full class names so Tailwind can see them
const CARD = "rounded-2xl border border-[var(--border)] bg-[var(--card)]";
const BTN =
  "rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45";
const BTN_PRIMARY =
  "rounded-lg border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-45";
const BTN_LG =
  "rounded-lg border border-[var(--ink)] bg-[var(--ink)] px-[18px] py-[9px] text-[0.88rem] font-semibold text-[var(--paper)]";
const BTN_GHOST =
  "rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--muted)] hover:text-[var(--bad)] disabled:cursor-not-allowed disabled:opacity-45";

// 70+ good, 40-69 warn, below 40 bad (same bands as the ATS score card)
const bandOf = (score) => (score >= 70 ? "good" : score >= 40 ? "warn" : "bad");
const SCORE_TEXT = {
  good: "text-[var(--good)]",
  warn: "text-[var(--warn)]",
  bad: "text-[var(--bad)]",
};

const STATUS = {
  completed: {
    label: "Completed",
    cls: "bg-[var(--good-bg)] text-[var(--good)]",
  },
  processing: {
    label: "Analyzing…",
    cls: "bg-[var(--warn-bg)] text-[var(--warn)]",
  },
  failed: { label: "Failed", cls: "bg-[var(--bad-bg)] text-[var(--bad)]" },
};

const scoreOf = (r) =>
  r.status === "completed" ? (r.analysis?.atsScore ?? null) : null;
const roleOf = (r) => r.analysis?.candidate?.targetRole || "";
const typeOf = (name) => (name.toLowerCase().endsWith(".docx") ? "DOC" : "PDF");
const byDate = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);

function formatSize(bytes = 0) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Date.now() - d.getTime() < 60_000) return "Just now";
  const opts = { month: "short", day: "numeric" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString("en-US", opts);
}

function Trend({ delta }) {
  if (delta === null)
    return (
      <span className="ml-2 text-xs text-[var(--muted)]">first upload</span>
    );
  if (delta === 0)
    return (
      <span className="ml-2 text-xs font-semibold text-[var(--muted)]">±0</span>
    );
  const up = delta > 0;
  return (
    <span
      className={`ml-2 text-xs font-semibold ${up ? "text-[var(--good)]" : "text-[var(--bad)]"}`}
    >
      {up ? "↑" : "↓"} {Math.abs(delta)}
    </span>
  );
}

function StatCard({ label, value, valueClass = "text-[var(--ink)]", note }) {
  return (
    <div className={`${CARD} px-5 py-[18px]`}>
      <div className="text-[0.82rem] font-medium text-[var(--muted)]">
        {label}
      </div>
      <div
        className={`font-space mt-0.5 text-[1.9rem] font-bold leading-tight ${valueClass}`}
      >
        {value}
      </div>
      <div className="truncate text-[0.8rem] text-[var(--muted)]">{note}</div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Page
------------------------------------------------------------------- */

export default function History({ onView, onUploadNew, onCompare }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState([]);

  // silent = refresh the table without replacing it with the loading spinner
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      setItems(await listHistory());
    } catch (err) {
      if (silent) setActionError(err.message);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- derived data ---------- */

  const counts = useMemo(
    () => ({
      all: items.length,
      completed: items.filter((r) => r.status === "completed").length,
      processing: items.filter((r) => r.status === "processing").length,
      failed: items.filter((r) => r.status === "failed").length,
    }),
    [items],
  );

  // Score change = this score minus the previous completed upload's score
  const { deltas, best, improvement } = useMemo(() => {
    const scored = items.filter((r) => scoreOf(r) !== null).sort(byDate);

    const deltas = {};
    scored.forEach((r, i) => {
      deltas[r._id] = i === 0 ? null : scoreOf(r) - scoreOf(scored[i - 1]);
    });

    const best = scored.reduce(
      (top, r) => (!top || scoreOf(r) > scoreOf(top) ? r : top),
      null,
    );
    const improvement =
      scored.length >= 2 ? scoreOf(scored.at(-1)) - scoreOf(scored[0]) : null;

    return { deltas, best, improvement };
  }, [items]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter(
        (r) =>
          (filter === "all" || r.status === filter) &&
          (!q ||
            r.originalName.toLowerCase().includes(q) ||
            roleOf(r).toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        if (sort === "oldest") return byDate(a, b);
        if (sort === "score") return (scoreOf(b) ?? -1) - (scoreOf(a) ?? -1);
        return byDate(b, a);
      });
  }, [items, query, filter, sort]);

  /* ---------- actions ---------- */

  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  async function handleRetry(id) {
    setBusyId(id);
    setActionError("");
    try {
      await retryResume(id);
    } catch (err) {
      setActionError(err.message);
    } finally {
      await load(true); // pick up the new status (or the new error text)
      setBusyId(null);
    }
  }

  async function handleDelete(r) {
    if (
      !window.confirm(
        `Delete "${r.originalName}" and its analysis? This can't be undone.`,
      )
    ) {
      return;
    }
    setBusyId(r._id);
    setActionError("");
    try {
      await deleteResume(r._id);
      setItems((list) => list.filter((x) => x._id !== r._id));
      setSelected((s) => s.filter((x) => x !== r._id));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  /* ---------- render ---------- */

  const improvementText =
    improvement === null
      ? "—"
      : improvement > 0
        ? `+${improvement}`
        : improvement < 0
          ? `−${Math.abs(improvement)}`
          : "0";
  const improvementClass =
    improvement > 0
      ? "text-[var(--good)]"
      : improvement < 0
        ? "text-[var(--bad)]"
        : "text-[var(--ink)]";

  return (
    <div className="mx-auto max-w-[1040px] px-7 pb-28 pt-9">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-space text-[1.8rem] font-bold text-[var(--ink)]">
            History
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Every resume you’ve analyzed, with score changes between versions.
          </p>
        </div>
        <button onClick={onUploadNew} className={BTN_LG}>
          + Upload new resume
        </button>
      </div>

      {loading && (
        <div className={`${CARD} flex min-h-64 items-center justify-center`}>
          <RefreshCw className="mr-3 h-5 w-5 animate-spin text-[var(--good)]" />
          <span className="text-sm text-[var(--muted)]">
            Loading history...
          </span>
        </div>
      )}

      {!loading && error && (
        <div className={`${CARD} flex items-start gap-3 p-6`}>
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--bad)]" />
          <div>
            <p className="text-sm text-[var(--bad)]">{error}</p>
            <button onClick={() => load()} className={`${BTN} mt-3`}>
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div
          className={`${CARD} flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center`}
        >
          <p className="font-space text-lg font-bold text-[var(--ink)]">
            No analyses yet
          </p>
          <p className="text-sm text-[var(--muted)]">
            Upload your first resume to see its score and track your progress
            here.
          </p>
          <button onClick={onUploadNew} className={BTN_LG}>
            Upload a resume
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          {actionError && (
            <p className="mb-4 rounded-lg bg-[var(--bad-bg)] px-3 py-2 text-sm text-[var(--bad)]">
              {actionError}
            </p>
          )}

          {/* Stats */}
          <div className="mb-7 grid gap-3.5 md:grid-cols-3">
            <StatCard
              label="Total analyses"
              value={counts.all}
              note={`${counts.completed} completed`}
            />
            <StatCard
              label="Best score"
              value={best ? scoreOf(best) : "—"}
              valueClass={
                best ? SCORE_TEXT[bandOf(scoreOf(best))] : "text-[var(--ink)]"
              }
              note={best ? best.originalName : "No completed analysis yet"}
            />
            <StatCard
              label="Improvement"
              value={improvementText}
              valueClass={improvementClass}
              note={
                improvement === null
                  ? "Upload another version to see progress"
                  : "since your first upload"
              }
            />
          </div>

          {/* Toolbar */}
          <div className="mb-3.5 flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by file name or role"
              className="min-w-[220px] flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]"
            />
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-3.5 py-1.5 text-[0.82rem] font-semibold ${
                    filter === f.key
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                  }`}
                >
                  {f.label} {counts[f.key]}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort"
              className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--ink)]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className={`${CARD} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[0.78rem] font-semibold text-[var(--muted)]">
                    <th className="w-11 px-4 py-3" />
                    <th className="px-4 py-3">Resume</th>
                    <th className="px-4 py-3">Target role</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-sm text-[var(--muted)]"
                      >
                        No analyses match your search or filter.
                      </td>
                    </tr>
                  )}

                  {rows.map((r) => {
                    const score = scoreOf(r);
                    const done = r.status === "completed";
                    const checked = selected.includes(r._id);
                    const busy = busyId === r._id;

                    return (
                      <tr
                        key={r._id}
                        className={`border-b border-[var(--border)] last:border-0 ${
                          checked ? "bg-[var(--good-bg)]" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            disabled={!done}
                            checked={checked}
                            onChange={() => toggleSelect(r._id)}
                            aria-label={`Select ${r.originalName}`}
                            className="h-[17px] w-[17px] accent-[var(--good)]"
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border border-[var(--border)] bg-[var(--paper)] text-[0.66rem] font-bold text-[var(--muted)]">
                              {typeOf(r.originalName)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-[0.9rem] font-semibold text-[var(--ink)]">
                                {r.originalName}
                              </div>
                              {r.status === "failed" ? (
                                <div className="truncate text-xs text-[var(--bad)]">
                                  {r.error || "Analysis failed."}
                                </div>
                              ) : (
                                <div className="text-xs text-[var(--muted)]">
                                  {formatDate(r.createdAt)} ·{" "}
                                  {formatSize(r.size)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-[0.9rem] text-[var(--ink)]">
                          {roleOf(r) || "—"}
                        </td>

                        <td className="px-4 py-3.5">
                          {score === null ? (
                            <span className="font-space text-xl font-bold text-[var(--muted)]">
                              —
                            </span>
                          ) : (
                            <>
                              <span
                                className={`font-space text-xl font-bold ${SCORE_TEXT[bandOf(score)]}`}
                              >
                                {score}
                              </span>
                              <Trend delta={deltas[r._id] ?? null} />
                            </>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-[11px] py-[3px] text-[0.74rem] font-bold ${STATUS[r.status?.toLowerCase()]?.cls ?? ""}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {STATUS[r.status?.toLowerCase()]?.label ?? r.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-2">
                            {done && (
                              <button
                                onClick={() => onView?.(r._id)}
                                className={BTN}
                              >
                                View
                              </button>
                            )}
                            {r.status === "processing" && (
                              <button disabled className={BTN}>
                                View
                              </button>
                            )}
                            {r.status === "failed" && (
                              <button
                                onClick={() => handleRetry(r._id)}
                                disabled={busy}
                                className={BTN_PRIMARY}
                              >
                                {busy ? "Retrying…" : "Retry"}
                              </button>
                            )}
                            {r.status !== "processing" && (
                              <button
                                onClick={() => handleDelete(r)}
                                disabled={busy}
                                className={BTN_GHOST}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[var(--border)] px-[18px] py-3.5 text-[0.82rem] text-[var(--muted)]">
              Showing {rows.length} of {items.length} analyses
            </div>
          </div>
        </>
      )}

      {/* Floating compare bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3.5 whitespace-nowrap rounded-[14px] bg-[var(--ink)] py-2.5 pl-5 pr-3 text-[var(--paper)] shadow-2xl">
          <span className="text-sm">{selected.length} selected</span>
          <button
            onClick={() => setSelected([])}
            className="rounded-lg px-3 py-1.5 text-[0.8rem] font-semibold opacity-80"
          >
            Clear
          </button>
          <button
            disabled={selected.length !== 2}
            onClick={() => onCompare?.(selected[0], selected[1])}
            className="rounded-lg bg-[var(--good)] px-3 py-1.5 text-[0.8rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            Compare versions
          </button>
        </div>
      )}
    </div>
  );
}
