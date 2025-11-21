import React from "react";

const PublicHome = () => {
  return (
    <main className="bg-black text-white min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full grid gap-8 md:grid-cols-[1fr_260px] items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
            Research Focused
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Hello. My name is <span className="text-gray-300">[Your Name]</span>
            <br />
            and I do <span className="text-gray-300">[Your Work]</span>.
          </h1>
          <p className="text-gray-400 max-w-2xl">
            This is a simple placeholder homepage for the publicly visible view.
            Swap in your real headshot and a concise research tagline when ready.
          </p>
        </div>
        <div className="mx-auto">
          <div className="w-52 h-52 rounded-full bg-gray-800 border border-gray-700 shadow-lg shadow-blue-500/10 flex items-center justify-center text-gray-500 text-sm">
            Headshot Placeholder
          </div>
        </div>
      </div>
    </main>
  );
};

export default PublicHome;
