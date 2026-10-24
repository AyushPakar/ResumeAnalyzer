import ProfileCard from "../pages/ProfileCard";
import DangerZone from "../pages/DangerZone";

export default function Settings({ onUserUpdate, onAccountDeleted, onLogout }) {
  return (
    <div className="mx-auto max-w-[760px] px-7 pb-20 pt-9">
      <h1 className="font-space text-[1.8rem] font-bold text-[var(--ink)]">
        Settings
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Manage your profile and account.
      </p>

      <div className="mt-7 space-y-5">
        <ProfileCard onUpdated={onUserUpdate} />
        <DangerZone onDeleted={onAccountDeleted} onLogout={onLogout} />
      </div>
    </div>
  );
}
