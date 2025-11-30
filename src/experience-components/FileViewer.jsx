import React, { useState } from "react";

// Syntax highlighting for code
const highlightJS = (code) => {
  const keywords = ['export', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'from', 'default', 'true', 'false', 'null', 'undefined'];
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="fv-string">$&</span>')
    .replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="fv-keyword">$1</span>')
    .replace(/\/\/.*$/gm, '<span class="fv-comment">$&</span>')
    .replace(/\b(\d+)\b/g, '<span class="fv-number">$1</span>');
};

const renderMarkdown = (content) => {
  let html = content
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3 class="fv-md-h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="fv-md-h2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="fv-md-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="fv-md-code"><code>$2</code></pre>')
    .replace(/`(.+?)`/g, '<code class="fv-md-inline-code">$1</code>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="fv-md-link" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p class="fv-md-p">')
    .replace(/\n/g, '<br />');

  html = html.replace(/(<li>.*<\/li>)/s, '<ul class="fv-md-ul">$1</ul>');

  return `<p class="fv-md-p">${html}</p>`;
};

// Icons
const Icons = {
  Copy: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>,
  Download: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"></path><path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"></path></svg>,
};

const CodeViewer = ({ file }) => {
  const [copied, setCopied] = useState(false);
  const lines = file.content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fv-code-header">
        <div className="fv-code-stats">
          {lines.length} lines
        </div>
        <div className="fv-action-group">
          <button className="fv-action-btn" onClick={handleCopy}>
            <Icons.Copy />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button className="fv-action-btn" onClick={handleDownload}>
            <Icons.Download />
            Download
          </button>
        </div>
      </div>
      <div className="fv-blob-wrapper">
        <table className="fv-code-table">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="fv-line-num">{i + 1}</td>
                <td className="fv-line-code" dangerouslySetInnerHTML={{ __html: highlightJS(line) || ' ' }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const PdfViewer = ({ file }) => {
  const [error, setError] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.file;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="fv-code-header">
        <div className="fv-code-stats">
          PDF Document
        </div>
        <div className="fv-action-group">
          <button className="fv-action-btn" onClick={handleDownload}>
            <Icons.Download />
            Download
          </button>
          <button className="fv-action-btn" onClick={() => window.open(file.file, '_blank')}>
            Open in New Tab
          </button>
        </div>
      </div>
      <div className="fv-pdf-wrapper">
        {!error ? (
          <iframe
            src={file.file}
            title={file.name}
            className="fv-pdf-iframe"
            onError={() => setError(true)}
          />
        ) : (
          <div className="fv-pdf-fallback">
            <p>Unable to display PDF inline.</p>
            <button className="fv-action-btn" onClick={() => window.open(file.file, '_blank')}>
              Open PDF in New Tab
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const ImageViewer = ({ file }) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.file;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="fv-code-header">
        <div className="fv-code-stats">
          Image
        </div>
        <div className="fv-action-group">
          <button className="fv-action-btn" onClick={handleDownload}>
            <Icons.Download />
            Download
          </button>
        </div>
      </div>
      <div className="fv-image-wrapper">
        <img src={file.file} alt={file.name} className="fv-image" />
      </div>
    </>
  );
};

const MarkdownViewer = ({ file }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fv-code-header">
        <div className="fv-code-stats">
          Markdown
        </div>
        <div className="fv-action-group">
          <button className="fv-action-btn" onClick={handleCopy}>
            <Icons.Copy />
            {copied ? "Copied!" : "Copy Raw"}
          </button>
        </div>
      </div>
      <div className="fv-markdown-wrapper" dangerouslySetInnerHTML={{ __html: renderMarkdown(file.content) }} />
    </>
  );
};

const FileViewer = ({ file }) => {
  if (!file) return null;

  return (
    <div className="fv-container">
      <style>{`
        .fv-container { width: 100%; }

        /* Code Header */
        .fv-code-header {
          background: #161b22;
          padding: 10px 16px;
          border-bottom: 1px solid #30363d;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .fv-code-stats { font-family: monospace; font-size: 12px; color: #e6edf3; }
        .fv-action-group { display: flex; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; }
        .fv-action-btn {
          background: #21262d;
          border: none;
          border-right: 1px solid #30363d;
          color: #e6edf3;
          padding: 5px 12px;
          font-size: 12px;
          cursor: pointer;
          display: flex; align-items: center; gap: 6px;
        }
        .fv-action-btn:last-child { border-right: none; }
        .fv-action-btn:hover { background: #30363d; }

        /* Code Viewer */
        .fv-blob-wrapper { overflow-x: auto; background: #000000; }
        .fv-code-table {
          width: 100%; border-collapse: collapse;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          font-size: 12px; line-height: 20px;
        }
        .fv-line-num { width: 50px; text-align: right; padding-right: 12px; color: #6e7681; user-select: none; cursor: pointer; vertical-align: top; }
        .fv-line-num:hover { color: #e6edf3; }
        .fv-line-code { padding-left: 12px; color: #e6edf3; white-space: pre; vertical-align: top; }

        /* Syntax Highlighting */
        .fv-keyword { color: #ff7b72; }
        .fv-string { color: #a5d6ff; }
        .fv-comment { color: #8b949e; }
        .fv-number { color: #79c0ff; }

        /* PDF Viewer */
        .fv-pdf-wrapper {
          width: 100%;
          height: 80vh;
          min-height: 600px;
          background: #000000;
        }
        .fv-pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .fv-pdf-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #7d8590;
          gap: 16px;
        }

        /* Image Viewer */
        .fv-image-wrapper {
          padding: 24px;
          background: #000000;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .fv-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
        }

        /* Markdown Viewer */
        .fv-markdown-wrapper {
          padding: 32px;
          background: #000000;
          color: #e6edf3;
          line-height: 1.6;
        }
        .fv-md-h1 { font-size: 2em; font-weight: 600; border-bottom: 1px solid #21262d; padding-bottom: 8px; margin: 16px 0; }
        .fv-md-h2 { font-size: 1.5em; font-weight: 600; border-bottom: 1px solid #21262d; padding-bottom: 8px; margin: 16px 0; }
        .fv-md-h3 { font-size: 1.25em; font-weight: 600; margin: 16px 0; }
        .fv-md-p { margin: 16px 0; }
        .fv-md-ul { padding-left: 24px; margin: 16px 0; }
        .fv-md-code { background: #161b22; padding: 16px; border-radius: 6px; overflow-x: auto; font-family: monospace; }
        .fv-md-inline-code { background: #161b22; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .fv-md-link { color: #2f81f7; text-decoration: none; }
        .fv-md-link:hover { text-decoration: underline; }
      `}</style>

      {file.type === 'code' && <CodeViewer file={file} />}
      {file.type === 'pdf' && <PdfViewer file={file} />}
      {file.type === 'image' && <ImageViewer file={file} />}
      {file.type === 'markdown' && <MarkdownViewer file={file} />}
    </div>
  );
};

export default FileViewer;
