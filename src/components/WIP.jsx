import { Link } from "react-router-dom";

const WIP = () => {
  return (
    <main className="bg-black text-white min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <p className="text-lg text-gray-400">Food is chopped and cooked before it's served and eaten</p>
      <Link
        to="/wip/home"
        className="inline-flex items-center rounded-md border border-white/15 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
      >
        Open WIP Home
      </Link>
    </main>
  );
};

export default WIP;
