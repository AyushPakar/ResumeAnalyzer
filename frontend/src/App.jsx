import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import Navbar from "./components/Navbar";
import LandingPage from "./components/Landingpage";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";
import { NavLinks } from "./utility/Data";
import {
  getCurrentUser,
  clearSession,
  setUnauthorizedHandler,
} from "./api/authApi";

// "Aditi Kapoor" -> "AK", "aditi@example.com" -> "AD"
function getInitials(user) {
  const source = user?.name || user?.email?.split("@")[0] || "";
  const parts = source
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase() || "?";
}

function App() {
  // Which screen is showing: "landing" | "login" | "signup" | "app"
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true); // checking for a saved login
  const [logout, setLogout] = useState(false); // logging out in progress

  // Inside the app
  const [active, setActive] = useState("dashboard");
  const [viewId, setViewId] = useState(null); // resume opened from History

  // On first load: is there a saved login that is still valid?
  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((savedUser) => {
        if (!cancelled && savedUser) {
          setUser(savedUser);
          setPage("app");
        }
      })
      .catch(() => {}) // server down or token rejected: just show the landing page
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // If a request comes back 401 later (session expired), go back to login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setViewId(null);
      setPage("login");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  function handleAuthSuccess(loggedInUser) {
    setUser(loggedInUser);
    setActive("dashboard");
    setPage("app");
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setViewId(null);
    setActive("dashboard");
    setPage("landing");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--paper)]">
        <RefreshCw className="h-5 w-5 animate-spin text-[var(--good)]" />
      </div>
    );
  }

  if (page === "landing") return <LandingPage onNavigate={setPage} />;
  if (page === "login")
    return <Login onNavigate={setPage} onSuccess={handleAuthSuccess} />;
  if (page === "signup")
    return <Signup onNavigate={setPage} onSuccess={handleAuthSuccess} />;

  const activeLink = NavLinks.find((link) => link.id === active);
  const ActiveComponent = activeLink?.component;

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navbar
        activeLink={active}
        onNavigate={(id) => {
          setViewId(null); // opening a tab yourself starts fresh
          setActive(id);
        }}
        userInitials={getInitials(user)}
        onLogout={handleLogout}
        onExport={() => console.log("Export clicked")}
      />

      <main>
        {ActiveComponent && (
          <ActiveComponent
            initialResumeId={viewId}
            onView={(id) => {
              setViewId(id);
              setActive("dashboard");
            }}
            onUploadNew={() => {
              setViewId(null);
              setActive("dashboard");
            }}
            onUserUpdate={(profile) => setUser((u) => ({ ...u, ...profile }))}
            onAccountDeleted={handleLogout}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}

export default App;
