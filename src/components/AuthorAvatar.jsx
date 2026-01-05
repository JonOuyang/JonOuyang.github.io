import React from "react";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const AuthorAvatar = ({ name }) => {
  const initials = getInitials(name);

  return (
    <div
      className="w-10 h-10 rounded-full bg-[#f6f1e7] text-[#2f2f2f] flex items-center justify-center text-xs font-semibold tracking-wide border border-white/10"
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
};

export default AuthorAvatar;
