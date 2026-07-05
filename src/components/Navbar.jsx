import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [mode, setMode] = useState("public"); // "public" | "experimental"
  const [publicNav, setPublicNav] = useState([]);
  const [experimentalNav, setExperimentalNav] = useState([]);

  // /walk: the glass pill floats over the animation and only materializes ~2s
  // into the sequence. Everywhere else it shows immediately.
  const isWalk = location.pathname.startsWith("/walk");
  // white-background routes get the light glass; black routes get dark glass
  const lightGlass = isWalk;
  const [shown, setShown] = useState(!isWalk);

  useEffect(() => {
    if (!isWalk) {
      setShown(true);
      return;
    }
    setShown(false);
    const t = setTimeout(() => setShown(true), 2000);
    return () => clearTimeout(t);
  }, [isWalk]);

  useEffect(() => {
    const isExperimentalRoute =
      location.pathname.startsWith("/experimental-projects") ||
      location.pathname.startsWith("/wip") ||
      location.pathname.startsWith("/card") ||
      location.pathname.startsWith("/walk") ||
      location.pathname.startsWith("/agy-home");

    setMode(isExperimentalRoute ? "experimental" : "public");
  }, [location.pathname]);

  useEffect(() => {
    const loadNav = async () => {
      try {
        const resp = await fetch("/data/nav.json");
        if (!resp.ok) throw new Error("nav fetch failed");
        const json = await resp.json();
        setPublicNav(json.publicNavItems || []);
        setExperimentalNav(json.experimentalNavItems || []);
      } catch (err) {
        console.error("Failed to load nav.json", err);
        // Minimal fallback to keep navigation working
        setPublicNav([
          { name: "Home", path: "/" },
          { name: "Work History", path: "/work-history" },
          { name: "Projects", path: "/projects" },
          { name: "Research", path: "/research" },
        ]);
        setExperimentalNav([
          { name: "AGY Home", path: "/agy-home" },
          { name: "Projects (Exp)", path: "/experimental-projects" },
        ]);
      }
    };
    loadNav();
  }, []);

  const navItems = mode === "experimental" ? experimentalNav : publicNav;

  const toggleMode = () => {
    setMode((prev) => (prev === "public" ? "experimental" : "public"));
  };

  // ── liquid glass surfaces ──
  const glass = lightGlass
    ? {
        background: "linear-gradient(135deg, rgba(255,255,255,0.60), rgba(255,255,255,0.28))",
        border: "1px solid rgba(255,255,255,0.65)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 1px rgba(255,255,255,0.25), 0 10px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
      }
    : {
        background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.35)",
      };

  const itemCls = lightGlass
    ? "text-neutral-600 hover:text-black hover:bg-black/[0.06]"
    : "text-zinc-400 hover:text-white hover:bg-white/10";
  const labelCls = lightGlass ? "text-neutral-500" : "text-gray-400";
  const resumeCls = lightGlass
    ? "bg-black/[0.04] border-black/10 hover:bg-black/[0.08] hover:border-black/20 text-neutral-600 hover:text-black"
    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-zinc-400 hover:text-white";
  const dividerCls = lightGlass ? "bg-black/10" : "bg-white/15";

  return (
    <>
      {/* spacer keeps normal-flow layout on every page except /walk, where the
          pill floats over the animation */}
      {!isWalk && <div className="hidden md:block h-14" />}

      <header className="fixed top-0 inset-x-0 z-50 hidden md:flex justify-center pointer-events-none">
        <nav
          className="mt-3 flex items-center gap-1 rounded-full py-1.5 pl-3 pr-1.5"
          style={{
            ...glass,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            pointerEvents: shown ? "auto" : "none",
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0) scale(1)" : "translateY(-16px) scale(0.96)",
            transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <button
            onDoubleClick={toggleMode}
            className="flex items-center gap-2 focus:outline-none active:opacity-80 shrink-0"
            title="Double-click to toggle public/experimental"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/2395/2395608.png" alt="Logo" width={22} height={22} />
            <span className={`text-[11px] uppercase tracking-wide ${labelCls}`}>
              {mode === "public" ? "Public" : "Experimental"}
            </span>
          </button>

          <div className={`mx-2 h-4 w-px hidden md:block ${dividerCls}`} />

          <div className="hidden md:flex items-center">
            {navItems.map((nav) => (
              <Link key={nav.name} to={nav.path}>
                <div className={`px-3.5 py-1.5 text-sm cursor-pointer rounded-full transition-all ${itemCls}`}>
                  {nav.name}
                </div>
              </Link>
            ))}
          </div>

          <div className={`mx-2 h-4 w-px hidden md:block ${dividerCls}`} />

          <a
            href="/resumes/CV/Jonathan_Ouyang_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-sm shrink-0 ${resumeCls}`}
          >
            <Download className="w-4 h-4" />
            <span>Resume</span>
          </a>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
