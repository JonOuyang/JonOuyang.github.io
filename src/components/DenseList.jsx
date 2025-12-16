import React from 'react';
import { FileText, Github, Globe, Code } from 'lucide-react';

const HighlightName = ({ text }) => {
  if (!text) return null;
  const parts = text.split('**');
  return (
    <span>
      {parts.map((part, i) => 
        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>
      )}
    </span>
  );
};

export const DenseRow = ({ 
  image, 
  title, 
  subtitle, 
  details, 
  date, 
  links = [],
}) => {
  return (
    <div className="group flex items-start sm:items-center gap-4 p-4 -mx-4 rounded-lg transition-all hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800/50 cursor-default">
      {/* Thumbnail */}
      <div className="flex-shrink-0 mt-1 sm:mt-0">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-[60px] h-[60px] object-cover rounded-md border border-zinc-800 bg-zinc-900 opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-[60px] h-[60px] rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-zinc-400 transition-colors">
             <div className="font-bold text-xl uppercase">{title.charAt(0)}</div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 mb-1">
          <h3 className="text-primary-text font-semibold text-base truncate pr-2 group-hover:text-accent-blue transition-colors">
            {title}
          </h3>
          <span className="text-xs text-zinc-500 font-mono flex-shrink-0">{date}</span>
        </div>
        
        <div className="text-sm text-secondary-text mb-1 line-clamp-1">
          {subtitle && (typeof subtitle === 'string' && subtitle.includes('**') ? <HighlightName text={subtitle} /> : subtitle)}
        </div>
        
        {details && (
          <div className="text-xs text-zinc-500 line-clamp-1">
            {details}
          </div>
        )}
        
        {/* Mobile Actions (Visible only on small screens) */}
        <div className="flex sm:hidden items-center gap-2 mt-3">
            {links.map((link, i) => (
            link.url && (
                <a 
                key={i} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="px-2 py-1 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-md hover:text-white hover:border-zinc-600 transition-all flex items-center gap-1.5"
                >
                {link.icon && <link.icon size={12} />}
                {link.label}
                </a>
            )
            ))}
        </div>
      </div>

      {/* Desktop Actions (Visible only on sm+) */}
      <div className="hidden sm:flex items-center gap-2 pl-4">
        {links.map((link, i) => (
          link.url && (
            <a 
              key={i} 
              href={link.url} 
              target="_blank" 
              rel="noreferrer"
              className="px-2 py-1 text-xs font-medium text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-md hover:text-accent-blue hover:border-accent-blue/30 transition-all flex items-center gap-1.5"
            >
              {link.icon && <link.icon size={12} />}
              {link.label}
            </a>
          )
        ))}
      </div>
    </div>
  );
};

export const DenseList = ({ title, items }) => {
  return (
    <div className="mb-16">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 px-2">
        {title}
      </h2>
      <div className="flex flex-col gap-1">
        {items.map((item, idx) => (
          <DenseRow key={idx} {...item} />
        ))}
      </div>
    </div>
  );
};
