import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full max-w-3xl mx-auto py-12 px-6 border-t border-zinc-900/50 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
      <div>
        &copy; {new Date().getFullYear()} Jonathan Ouyang. All rights reserved.
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue"></span>
        </span>
        <span>Building Agents</span>
      </div>
    </footer>
  );
};

export default Footer;
