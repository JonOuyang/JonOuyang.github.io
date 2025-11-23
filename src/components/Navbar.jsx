import { useState } from "react";
import { Link } from "react-router-dom";
import { appleImg, bagImg } from "../utils";
import { publicNavItems, experimentalNavItems } from "../constants";

const Navbar = () => {
  const [mode, setMode] = useState("public"); // "public" | "experimental"
  const navItems = mode === "experimental" ? experimentalNavItems : publicNavItems;

  const toggleMode = () => {
    setMode((prev) => (prev === "public" ? "experimental" : "public"));
  };

  return (
    <header className="w-full py-5 sm:px-10 px-5 flex justify-between items-center">
      <nav className="flex w-full screen-max-width">
        <button
          onDoubleClick={toggleMode}
          className="flex items-center gap-2 focus:outline-none active:opacity-80"
          title="Double-click to toggle public/experimental"
        >
          <img src={appleImg} alt="Apple" width={14} height={18} />
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
