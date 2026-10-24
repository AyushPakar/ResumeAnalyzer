// Page Components
import Dashboard from "../components/pages/Dashboard";
import History from "../components/pages/History";
import LearningPath from "../components/pages/LearningPath";
import Settings from "../components/pages/Settings";

// Navigation Links
export const NavLinks = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Overview of your resume analysis and ATS score.",
    component: Dashboard,
  },
  {
    id: "history",
    name: "History",
    description: "View your previous resume analyses.",
    component: History,
  },
  {
    id: "settings",
    name: "Settings",
    description: "Manage your account and application preferences.",
    component: Settings,
  },
];

// User Information
export const USER_INFO = {
  name: "Ayush",
  initials: "AK",
};

// Default Export
const DATA = {
  NavLinks,
  USER_INFO,
};

export default DATA;
