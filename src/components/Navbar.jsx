import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appleImg, bagImg } from "../utils";

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
    <header className="w-full py-2 sm:px-10 px-5 flex justify-between items-center bg-black/80 backdrop-blur-sm border-b border-white/5">
      <nav className="flex w-full screen-max-width">
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

        <div className="flex flex-1 justify-center max-sm:hidden">
          {navItems.map((nav) => (
            <Link key={nav.name} to={nav.path}>
              <div className="px-4 py-2 mx-1 text-sm cursor-pointer text-gray hover:text-white hover:bg-gray-700/50 rounded-md transition-all">
                {nav.name}
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-baseline gap-7 max-sm:justify-end max-sm:flex-1">
          <img src={bagImg} alt="bag" width={18} height={18} />
        </div>
      </nav>
    </header>
  )
}

export default Navbar
