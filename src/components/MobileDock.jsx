import { Home, Briefcase, FolderGit2, FlaskConical } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MobileDock = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Briefcase, label: "Work", path: "/work-history" },
    { icon: FolderGit2, label: "Projects", path: "/projects" },
    { icon: FlaskConical, label: "Research", path: "/research" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 md:hidden">
      <nav className="flex items-center justify-around rounded-2xl border border-white/10 bg-zinc-900/90 px-2 py-3 shadow-2xl backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-all duration-300 ${
                active ? "text-white scale-110" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileDock;
