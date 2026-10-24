export default function Logo({ className = "" }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="font-space grid h-[30px] w-[30px] place-items-center rounded-lg bg-[var(--ink)] text-[0.85rem] font-bold text-[var(--paper)]">
        RS
      </span>
      <span className="font-space text-[1.15rem] font-bold text-[var(--ink)]">
        ResumeScope
      </span>
    </span>
  );
}
