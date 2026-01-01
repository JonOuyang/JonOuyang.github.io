import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";

const Navbar = () => {
  const [mode, setMode] = useState("public"); // "public" | "experimental"
  const [publicNav, setPublicNav] = useState([]);
  const [experimentalNav, setExperimentalNav] = useState([]);

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
          { name: "Projects (Exp)", path: "/experimental-projects" },
          { name: "WIP", path: "/wip" },
        ]);
      }
    };
    loadNav();
  }, []);

  const navItems = mode === "experimental" ? experimentalNav : publicNav;

  const toggleMode = () => {
    setMode((prev) => (prev === "public" ? "experimental" : "public"));
  };

  return (
    <header className="w-full py-2 pt-3 sm:px-10 px-5 flex justify-between items-center bg-black/80 backdrop-blur-sm border-b border-white/5">
      <nav className="relative flex w-full items-center">
        <div className="flex items-center justify-start">
          <button
            onDoubleClick={toggleMode}
            className="flex items-center gap-2 focus:outline-none active:opacity-80"
            title="Double-click to toggle public/experimental"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/2395/2395608.png" alt="Logo" width={24} height={24} />
            <span className="text-xs uppercase tracking-wide text-gray-400">
              {mode === "public" ? "Public" : "Experimental"}
            </span>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden justify-center md:flex">
          {navItems.map((nav) => (
            <Link key={nav.name} to={nav.path}>
              <div className="px-4 py-2 mx-1 text-sm cursor-pointer text-gray hover:text-white hover:bg-gray-700/50 rounded-md transition-all">
                {nav.name}
              </div>
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center justify-end pr-6 sm:pr-12 lg:pr-16">
          <a
            href="/resumes/CV/Jonathan_Ouyang_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-zinc-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
            <span>Resume</span>
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
