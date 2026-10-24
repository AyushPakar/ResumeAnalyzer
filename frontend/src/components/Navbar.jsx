import { NavLinks } from "../utility/Data";

export default function Navbar({
  activeLink = "dashboard",
  userInitials = "AK",
  onExport,
  onNavigate,
}) {
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-50 py-[18px] pt-[calc(18px+env(safe-area-inset-top,0px))]">
      {/* Logo */}
      <div className="flex items-center gap-[10px]">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[var(--ink)] font-['Space_Grotesk'] text-[0.85rem] font-bold text-[var(--paper)]">
          RS
        </div>

        <span className="font-['Space_Grotesk'] text-[1.15rem] font-bold text-[var(--ink)]">
          ResumeScope
        </span>
      </div>

      {/* Navigation Links */}
      <div className="hidden items-center gap-7 md:flex">
        {NavLinks.map((link) => {
          const isActive = link.id === activeLink;

          return (
            <button
              key={link.id}
              onClick={() => onNavigate?.(link.id)}
              className={`cursor-pointer border-0 bg-transparent font-['Inter'] text-[0.92rem] transition-colors ${
                isActive
                  ? "font-semibold text-[var(--ink)]"
                  : "font-medium text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {link.name}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Export Button */}
        <button
          onClick={onExport}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-[18px] py-[9px] text-[0.88rem] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--paper)]"
        >
          Export report
        </button>
      </div>
    </nav>
  );
}
