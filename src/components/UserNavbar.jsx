import { useEffect, useMemo, useRef, useState } from "react";
import { FaCarSide, FaChevronDown, FaUserCircle, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { NotificationBell } from "./notifications/NotificationBell";
import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  getAuthProfile,
} from "../utils/auth";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { label: "Browse Cars", href: "#featured-cars", type: "anchor" },
  { label: "Sell Car", to: "/sellcar", type: "route" },
  { label: "Login", to: "/login", type: "route" },
  { label: "Signup", to: "/signup", type: "route" },
  { label: "Admin", to: "/adminpanel", type: "route" },
];

const UserNavbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => getAuthProfile());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const syncProfile = () => {
      setProfile(getAuthProfile());
    };

    const closeOnOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener(AUTH_SESSION_EVENT, syncProfile);
    window.addEventListener("storage", syncProfile);
    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncProfile);
      window.removeEventListener("storage", syncProfile);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (item.label === "Admin") {
      return profile.isLoggedIn && profile.isAdmin;
    }
    if (profile.isLoggedIn) {
      return item.label !== "Login" && item.label !== "Signup";
    }
    return true;
  });

  const initials = useMemo(() => {
    const words = String(profile.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return "PR";
  }, [profile.name]);

  const handleLogout = () => {
    clearAuthSession();
    setOpen(false);
    setProfileOpen(false);
    navigate("/login");
  };

  const hasCompleteProfile =
    Boolean(profile.mobile) &&
    Boolean(profile.address) &&
    Boolean(profile.city) &&
    Boolean(profile.area) &&
    Boolean(profile.pinCode);

  const navLinkClass =
    "text-sm font-medium text-text-muted hover:text-primary-600 transition-colors";
  
  const mobileNavLinkClass = 
    "block w-full text-left px-4 py-3 text-base font-medium rounded-xl text-text-muted hover:text-primary-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors";

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center gap-4">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xl font-bold tracking-tight text-text-main"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition group-hover:bg-primary-500">
            <FaCarSide className="text-sm" />
          </span>
          <span>CarScout</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex ml-8 flex-1 items-center gap-8">
          {visibleItems.map((item) =>
            item.type === "anchor" ? (
              <a key={item.label} href={item.href} className={navLinkClass}>
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.to} className={navLinkClass}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:text-primary-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          </button>

          {profile.isLoggedIn ? (
            <div className="hidden md:flex items-center gap-4">
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface p-1 pr-3 hover:border-primary-400 transition-colors shadow-sm"
                  aria-label="Open profile menu"
                >
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt="Profile"
                      className="h-8 w-8 rounded-full border border-border-subtle object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 dark:bg-zinc-200 text-xs font-bold text-white dark:text-zinc-900">
                      {initials}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate text-sm font-medium text-text-main">
                    {profile.name}
                  </span>
                  <FaChevronDown className="text-xs text-text-muted" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-border-subtle bg-bg-surface p-2 shadow-lg backdrop-blur-lg">
                    <div className="flex items-center gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 mb-2">
                      {profile.image ? (
                        <img
                          src={profile.image}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 dark:bg-zinc-200 text-sm font-bold text-white dark:text-zinc-900">
                           {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-main">{profile.name}</p>
                        <p className="truncate text-xs text-text-muted">{profile.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        {hasCompleteProfile ? "My Profile" : "Complete Profile"}
                      </Link>
                      {profile.isAdmin && (
                        <Link
                          to="/adminpanel"
                          onClick={() => setProfileOpen(false)}
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="my-1 border-t border-border-subtle"></div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-text-main hover:text-primary-600 transition">
                Sign in
              </Link>
              <Link to="/signup" className="btn-primary py-2 text-sm shadow-none">
                Start for free
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {open ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-border-subtle bg-bg-surface px-6 py-4 absolute left-0 w-full shadow-lg">
          {profile.isLoggedIn && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border-subtle bg-zinc-50 dark:bg-zinc-800/50 p-4">
              <div className="flex items-center gap-3 min-w-0">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt="Profile"
                    className="h-10 w-10 rounded-full border border-border-subtle object-cover shrink-0"
                  />
                ) : (
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 dark:bg-zinc-200 text-sm font-bold text-white dark:text-zinc-900">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-main">{profile.name}</p>
                  <p className="truncate text-xs text-text-muted">{profile.email}</p>
                </div>
              </div>
              <NotificationBell />
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {visibleItems.map((item) =>
              item.type === "anchor" ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={mobileNavLinkClass}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={mobileNavLinkClass}
                >
                  {item.label}
                </Link>
              )
            )}

            {profile.isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={mobileNavLinkClass}
                >
                  {hasCompleteProfile ? "My Profile" : "Complete Profile"}
                </Link>
                <div className="my-2 border-t border-border-subtle"></div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-base font-medium text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-center w-full">Sign in</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary text-center w-full">Start free</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default UserNavbar;
