import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileViewer from "./FileViewer";
import { workHistoryData, getFolderByPath, getFileFromFolder, getAllFolders, getRootFiles, getRootFileByName } from "./workHistoryData";

// --- ICONS ---
const Icons = {
  Code: () => <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25Z"></path></svg>,
  Star: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>,
  Book: () => <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path></svg>,
  File: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="#7d8590"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm7.43 1.78 1.57 1.57L11.063 2H10.5v2.25c0 .138.112.25.25.25h2.25v-.563Z"></path></svg>,
  Folder: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="#54aeff"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.22 5.54 1 5 1H1.75Z"></path></svg>,
  List: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path></svg>,
  ChevronRight: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path></svg>,
  ChevronDown: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L8 8.94l3.72-3.72a.749.749 0 0 1 1.06 0Z"></path></svg>,
  Search: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"></path></svg>
};

const GitHubRepoViewer = () => {
  const navigate = useNavigate();
  const { folderPath, fileName } = useParams();

  const [expandedFolders, setExpandedFolders] = useState({});

  const isRootView = folderPath === "root";
  const currentFolder = isRootView ? null : getFolderByPath(folderPath);
  const currentFile = fileName
    ? (isRootView ? getRootFileByName(fileName) : getFileFromFolder(folderPath, fileName))
    : null;
  const allFolders = getAllFolders();
  const rootFiles = getRootFiles();

  useEffect(() => {
    if (folderPath) {
      setExpandedFolders(prev => ({ ...prev, [folderPath]: true }));
    }
  }, [folderPath]);

  const handleFileClick = (file) => navigate(`/work-history/${folderPath}/${file.name}`);
  const handleBackToFolder = () => navigate(`/work-history/${folderPath}`);
  const handleBackToWorkHistory = () => navigate('/work-history');
  const handleFolderClick = (folder) => navigate(`/work-history/${folder.path}`);

  const toggleFolderExpand = (path) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  if (!isRootView && !currentFolder) {
    return (
      <div style={{ padding: 40, color: '#e6edf3', textAlign: 'center' }}>
        <h2>Folder not found</h2>
        <button onClick={handleBackToWorkHistory} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
          Back to Work History
        </button>
      </div>
    );
  }

  if (isRootView && !currentFile) {
    return (
      <div style={{ padding: 40, color: '#e6edf3', textAlign: 'center' }}>
        <h2>File not found</h2>
        <button onClick={handleBackToWorkHistory} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
          Back to Work History
        </button>
      </div>
    );
  }

  return (
    <div className="gh-wrapper">
      <style>{`
        .gh-wrapper {
          background-color: #000000;
          color: #e6edf3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          width: 100%;
          min-height: 100vh;
          line-height: 1.5;
        }
        .gh-wrapper * { box-sizing: border-box; }

        /* TABS */
        .gh-tabs { display: flex; gap: 8px; padding: 0 32px; border-bottom: 1px solid #30363d; margin-top: 16px; overflow-x: auto; }
        .gh-tab {
          padding: 0 12px 8px 12px; font-size: 14px; color: #e6edf3;
          border-bottom: 2px solid transparent; cursor: pointer;
          display: flex; align-items: center; gap: 8px; white-space: nowrap;
        }
        .gh-tab.active { border-bottom-color: #f78166; font-weight: 600; }
        .gh-tab:hover { color: #e6edf3; }
        .gh-tab-icon { color: #7d8590; }

        /* SPLIT LAYOUT */
        .gh-split-view {
          display: flex;
          max-width: 90%;
          margin: 0 auto 0 5%;
          min-height: calc(100vh - 80px);
        }

        /* LEFT SIDEBAR - FILE TREE */
        .gh-left-sidebar {
          width: 20%;
          min-width: 200px;
          max-width: 280px;
          flex-shrink: 0;
          background: #000000;
          border-right: 1px solid #30363d;
          padding: 16px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .gh-file-tree {
          overflow: hidden;
          width: 100%;
        }

        .gh-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #e6edf3;
        }

        .gh-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 6px 10px;
          margin-bottom: 16px;
          color: #7d8590;
          font-size: 12px;
          cursor: pointer;
          overflow: hidden;
        }
        .gh-search-box:hover { border-color: #8b949e; }

        /* File Tree */
        .gh-tree-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 14px;
          color: #e6edf3;
          cursor: pointer;
          user-select: none;
          position: relative;
          overflow: hidden;
          width: 100%;
        }
        .gh-tree-item:hover { background: #161b22; }
        .gh-tree-item.active { background: #161b22; }
        .gh-tree-item-name {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }
        .gh-tree-item svg {
          flex-shrink: 0;
        }
        .gh-tree-children {
          margin-left: 16px;
          border-left: 1px solid #21262d;
          padding-left: 8px;
          overflow: hidden;
        }
        .gh-tree-chevron {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7d8590;
          flex-shrink: 0;
        }

        /* RIGHT CONTENT PANE */
        .gh-content-pane {
          flex: 1;
          padding: 24px 32px;
          overflow-x: hidden;
          min-width: 0;
        }

        /* BREADCRUMB */
        .gh-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        .gh-breadcrumb-link {
          color: #2f81f7;
          text-decoration: none;
          cursor: pointer;
        }
        .gh-breadcrumb-link:hover { text-decoration: underline; }
        .gh-breadcrumb-separator { color: #7d8590; }
        .gh-breadcrumb-current { color: #e6edf3; font-weight: 600; }

        /* FILE TABLE */
        .gh-file-box { border: 1px solid #30363d; border-radius: 6px; background: #000000; margin-bottom: 24px; }
        .gh-commit-header {
          background: #161b22; padding: 12px 16px; border-bottom: 1px solid #30363d;
          border-top-left-radius: 6px; border-top-right-radius: 6px;
          display: flex; align-items: center; gap: 12px; font-size: 13px; color: #7d8590;
        }
        .gh-avatar { width: 24px; height: 24px; border-radius: 50%; background-color: #30363d; }
        .gh-commit-msg { color: #7d8590; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-right: auto; }

        .gh-file-row {
          display: flex; align-items: center; padding: 10px 16px; border-top: 1px solid #21262d;
          font-size: 14px; color: #e6edf3; cursor: pointer;
        }
        .gh-file-row:hover { background-color: #161b22; }
        .gh-row-icon { width: 32px; color: #7d8590; flex-shrink: 0; }
        .gh-row-name { flex: 0 0 200px; color: #2f81f7; }
        .gh-row-name:hover { text-decoration: underline; }
        .gh-row-msg { flex: 1; color: #7d8590; margin: 0 16px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .gh-row-time { font-size: 13px; color: #7d8590; white-space: nowrap; text-align: right; width: 100px; }

        /* README AREA */
        .gh-readme { border: 1px solid #30363d; border-radius: 6px; }
        .gh-readme-head {
          padding: 10px 16px; border-bottom: 1px solid #30363d; background: #000000;
          display: flex; align-items: center; justify-content: space-between;
        }
        .gh-readme-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #e6edf3; }
        .gh-readme-body { padding: 32px; }
        .gh-readme-body h1 { border-bottom: 1px solid #21262d; padding-bottom: 8px; font-size: 24px; margin-bottom: 16px; margin-top: 0; }
        .gh-readme-body h2 { font-size: 18px; margin-bottom: 12px; margin-top: 24px; }
        .gh-readme-body p { color: #e6edf3; margin-bottom: 16px; }
        .gh-readme-body ul { color: #7d8590; padding-left: 20px; }
        .gh-readme-body li strong { color: #e6edf3; }

        @media (max-width: 900px) {
          .gh-split-view { flex-direction: column; }
          .gh-left-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #30363d;
            max-height: 300px;
          }
          .gh-row-msg, .gh-row-time { display: none; }
          .gh-row-name { flex: 1; }
        }
      `}</style>

      {/* TABS */}
      <div className="gh-tabs">
        <div className="gh-tab active" onClick={handleBackToWorkHistory}>
          <span className="gh-tab-icon"><Icons.Code /></span>
          Work
        </div>
        <div className="gh-tab" onClick={handleBackToWorkHistory}>
          <span className="gh-tab-icon"><Icons.Star /></span>
          Extracurriculars
        </div>
      </div>

      <div className="gh-split-view">
        {/* LEFT SIDEBAR - FILE TREE */}
        <div className="gh-left-sidebar">
          <div className="gh-sidebar-header">
            <span>Files</span>
          </div>

          <div className="gh-search-box">
            <Icons.Search />
            <span>Go to file</span>
          </div>

          <div className="gh-file-tree">
            {allFolders.map((folder) => (
              <div key={folder.path}>
                <div
                  className={`gh-tree-item ${folderPath === folder.path && !currentFile ? 'active' : ''}`}
                  onClick={() => {
                    toggleFolderExpand(folder.path);
                    handleFolderClick(folder);
                  }}
                >
                  <span className="gh-tree-chevron">
                    {expandedFolders[folder.path] ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                  </span>
                  <Icons.Folder />
                  <span className="gh-tree-item-name">{folder.name}</span>
                </div>

                {expandedFolders[folder.path] && (
                  <div className="gh-tree-children">
                    {folder.files.map((file, i) => (
                      <div
                        key={i}
                        className={`gh-tree-item ${currentFile?.name === file.name && folderPath === folder.path ? 'active' : ''}`}
                        onClick={() => navigate(`/work-history/${folder.path}/${file.name}`)}
                      >
                        <Icons.File />
                        <span className="gh-tree-item-name">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {rootFiles.map((file, i) => (
              <div
                key={i}
                className={`gh-tree-item ${isRootView && currentFile?.name === file.name ? 'active' : ''}`}
                onClick={() => navigate(`/work-history/root/${file.name}`)}
              >
                <Icons.File />
                <span className="gh-tree-item-name">{file.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT PANE */}
        <div className="gh-content-pane">
          <div className="gh-breadcrumb">
            <span className="gh-breadcrumb-link" onClick={handleBackToWorkHistory}>work-history</span>
            {isRootView ? (
              <>
                <span className="gh-breadcrumb-separator">/</span>
                <span className="gh-breadcrumb-current">{currentFile?.name}</span>
              </>
            ) : (
              <>
                <span className="gh-breadcrumb-separator">/</span>
                <span
                  className={currentFile ? "gh-breadcrumb-link" : "gh-breadcrumb-current"}
                  onClick={currentFile ? handleBackToFolder : undefined}
                >
                  {currentFolder?.name}
                </span>
                {currentFile && (
                  <>
                    <span className="gh-breadcrumb-separator">/</span>
                    <span className="gh-breadcrumb-current">{currentFile.name}</span>
                  </>
                )}
              </>
            )}
          </div>

          <div className="gh-file-box">
            <div className="gh-commit-header">
              <div className="gh-avatar"></div>
              <span style={{fontWeight:600, color: '#e6edf3'}}>JonOuyang</span>
              <span className="gh-commit-msg">{currentFile ? currentFile.msg : currentFolder?.msg}</span>
              <span style={{whiteSpace:'nowrap'}}>a6fd9b5 · {currentFile ? currentFile.date : currentFolder?.date}</span>
              <div style={{display:'flex', gap:4, marginLeft:10}}>
                <Icons.List />
                <span>24 commits</span>
              </div>
            </div>

            {currentFile ? (
              <FileViewer file={currentFile} />
            ) : (
              <>
                <div className="gh-file-row" onClick={handleBackToWorkHistory}>
                  <div className="gh-row-icon" style={{ color: '#2f81f7' }}>..</div>
                  <div className="gh-row-name">Go to parent directory</div>
                  <div className="gh-row-msg"></div>
                  <div className="gh-row-time"></div>
                </div>
                {currentFolder?.files.map((file, i) => (
                  <div key={i} className="gh-file-row" onClick={() => handleFileClick(file)}>
                    <div className="gh-row-icon"><Icons.File /></div>
                    <div className="gh-row-name">{file.name}</div>
                    <div className="gh-row-msg">{file.msg}</div>
                    <div className="gh-row-time">{file.date}</div>
                  </div>
                ))}
              </>
            )}
          </div>

          {!currentFile && currentFolder?.readme && (
            <div className="gh-readme">
              <div className="gh-readme-head">
                <div className="gh-readme-title">
                  <Icons.Book />
                  README.md
                </div>
              </div>
              <div className="gh-readme-body" dangerouslySetInnerHTML={{
                __html: currentFolder.readme
                  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^\- (.*$)/gim, '<li>$1</li>')
                  .replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/\n/g, '<br />')
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubRepoViewer;
