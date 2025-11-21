import React, { useMemo, useState } from "react";

// --- CONFIGURATION ---
const LANE_SPACING = 180;
const VERTICAL_SPACING = 100;
const PADDING = 80;

// --- ICONS (Exact GitHub SVGs) ---
const Icons = {
  Book: () => <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path></svg>,
  Repo: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path></svg>,
  Code: () => <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25Z"></path></svg>,
  Branch: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M9.5 3.25a2.25 2.25 0 1 1 3 1.75h-2.25a.75.75 0 0 0-.75.75v2.042a.75.75 0 0 1-.018.164l3.104 3.104a2.25 2.25 0 1 1-1.06 1.06l-3.105-3.105a.75.75 0 0 1-.164-.018V6.5a2.25 2.25 0 1 1 1.243-3.25Zm-4.25-.75a.75.75 0 0 0-.75.75v2.792a.75.75 0 0 0 .018.164l-3.104 3.104a2.25 2.25 0 1 0 1.06 1.06l3.105-3.105a.75.75 0 0 0 .164-.018V3.25a.75.75 0 0 0-.75-.75Zm4.25 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM6 12.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM9.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5.25 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path></svg>,
  File: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm7.43 1.78 1.57 1.57L11.063 2H10.5v2.25c0 .138.112.25.25.25h2.25v-.563Z"></path></svg>,
  Folder: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="#54aeff"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.22 5.54 1 5 1H1.75Z"></path></svg>,
  Star: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>,
  Eye: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>,
  Fork: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>,
  List: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path></svg>
};

// --- LOGIC ---
const buildGraph = (experiences, branches) => {
  // Dynamically get lane order from branches prop
  const laneOrder = Object.keys(branches);
  const lanePosition = laneOrder.reduce((acc, key, idx) => {
    acc[key] = idx * LANE_SPACING + PADDING;
    return acc;
  }, {});

  const nodes = [];
  const edges = [];
  const lastByBranch = {};

  experiences.forEach((exp, idx) => {
    const primary = exp.branches.includes("main") || !exp.branches.length ? "main" : exp.branches[0];
    const x = lanePosition[primary] ?? lanePosition["main"];
    const y = PADDING + idx * VERTICAL_SPACING;
    
    const node = { ...exp, x, y, primary };
    nodes.push(node);

    exp.branches.forEach((branch) => {
      const prev = lastByBranch[branch];
      if (prev) {
        edges.push({ from: prev, to: node.id, branch });
      }
      lastByBranch[branch] = node.id;
    });
  });

  const width = (laneOrder.length - 1) * LANE_SPACING + PADDING * 2;
  const height = PADDING * 2 + VERTICAL_SPACING * Math.max(nodes.length - 1, 0);

  return { nodes, edges, width, height, lanePosition };
};

const GitHubExperience = ({ workData, extracurricularData, contributors }) => {
  const [activeTab, setActiveTab] = useState("work");
  const [activeBranch, setActiveBranch] = useState("main");
  const [isBranchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Select data based on active tab
  const currentData = activeTab === "work" ? workData : extracurricularData;
  const experiences = currentData.experiences;
  const branches = currentData.branches;

  const { nodes, edges, width, height, lanePosition } = useMemo(
    () => buildGraph(experiences, branches),
    [experiences, branches]
  );

  const filteredNodes = activeBranch === "all" 
    ? nodes 
    : nodes.filter((n) => n.branches.includes(activeBranch) || n.branches.includes("main")); 

  const filteredEdges = activeBranch === "all" 
    ? edges 
    : edges.filter((e) => e.branch === activeBranch || e.branch === "main");

  const toggleBranchDropdown = () => setBranchDropdownOpen(!isBranchDropdownOpen);
  const selectBranch = (key) => {
    setActiveBranch(key);
    setBranchDropdownOpen(false);
  };

  const files = [
    { type: 'folder', name: "Portfolio", msg: "added readme descriptions for files", time: "6 months ago" },
    { type: 'file', name: "README.md", msg: "Update README.md", time: "6 months ago" },
    { type: 'file', name: "CV.pdf", msg: "Updated formatting for ATS", time: "2 days ago" },
    { type: 'file', name: "Resume.pdf", msg: "Compressed version", time: "3 months ago" },
  ];

  return (
    <div className="gh-wrapper">
      <style>{`
        .gh-wrapper {
          background-color: #000000; /* Pure Black as requested */
          color: #e6edf3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          width: 100%;
          min-height: 100vh;
          line-height: 1.5;
        }
        .gh-wrapper * { box-sizing: border-box; }
        
        /* LINKS */
        .gh-link { color: #e6edf3; text-decoration: none; font-weight: 600; }
        .gh-link:hover { text-decoration: underline; color: #2f81f7; }
        .gh-link-blue { color: #2f81f7; text-decoration: none; }
        .gh-link-blue:hover { text-decoration: underline; }

        /* HEADER */
        .gh-header { padding: 16px 32px; background-color: #000000; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .gh-header-title { display: flex; align-items: center; gap: 8px; font-size: 20px; color: #2f81f7; }
        .gh-badge-public { border: 1px solid #30363d; border-radius: 24px; padding: 0 7px; font-size: 12px; font-weight: 500; color: #7d8590; height: 20px; display: flex; align-items: center; }
        
        .gh-header-actions { display: flex; gap: 8px; }
        .gh-btn-group { display: inline-flex; }
        .gh-btn-sub { 
          background-color: #21262d; border: 1px solid #30363d; color: #e6edf3; 
          padding: 3px 12px; font-size: 12px; font-weight: 500; cursor: pointer;
          display: flex; align-items: center; gap: 4px; height: 28px; line-height: 20px;
          border-top-left-radius: 6px; border-bottom-left-radius: 6px;
        }
        .gh-btn-sub-count { 
           background-color: #21262d; border: 1px solid #30363d; border-left: none; color: #e6edf3;
           padding: 3px 8px; font-size: 12px; font-weight: 500; height: 28px; display: flex; align-items: center;
           border-top-right-radius: 6px; border-bottom-right-radius: 6px;
        }
        .gh-btn-sub:hover { background-color: #30363d; }
        
        /* TABS */
        .gh-tabs { display: flex; gap: 8px; padding: 0 32px; border-bottom: 1px solid #30363d; margin-top: 16px; overflow-x: auto; }
        .gh-tab { 
          padding: 0 12px 8px 12px; font-size: 14px; color: #e6edf3; 
          border-bottom: 2px solid transparent; cursor: pointer; 
          display: flex; align-items: center; gap: 8px; white-space: nowrap; 
        }
        .gh-tab.active { border-bottom-color: #f78166; font-weight: 600; }
        .gh-tab-icon { color: #7d8590; }
        
        /* LAYOUT */
        .gh-container { display: flex; max-width: 1280px; margin: 0 auto; padding: 24px 32px; gap: 24px; align-items: flex-start; }
        .gh-main { flex: 1; min-width: 0; }
        .gh-sidebar { width: 296px; flex-shrink: 0; }
        
        @media (max-width: 768px) {
          .gh-container { flex-direction: column; padding: 16px; }
          .gh-sidebar { width: 100%; }
          .gh-header { padding: 16px; }
        }

        /* CONTROLS */
        .gh-controls { display: flex; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 16px; }
        .gh-branch-btn { 
          background: #21262d; border: 1px solid #30363d; color: #e6edf3; border-radius: 6px; 
          padding: 5px 12px; font-size: 14px; font-weight: 500; cursor: pointer; 
          display: flex; align-items: center; gap: 8px; height: 32px; 
        }
        .gh-file-actions { display: flex; gap: 8px; }
        .gh-btn { 
            padding: 5px 16px; font-size: 14px; font-weight: 500; border-radius: 6px; border: 1px solid #30363d;
            background: #21262d; color: #e6edf3; cursor: pointer; height: 32px;
        }
        .gh-btn-primary { background: #238636; border-color: rgba(240,246,252,0.1); color: #ffffff; }
        .gh-dropdown { position: absolute; top: 100%; left: 0; width: 300px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; z-index: 50; margin-top: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }

        /* FILE TABLE (Flexbox Implementation) */
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
            font-size: 14px; color: #e6edf3;
        }
        .gh-file-row:hover { background-color: #161b22; }
        .gh-row-icon { width: 32px; color: #7d8590; flex-shrink: 0; }
        .gh-row-name { flex: 0 0 200px; }
        .gh-row-msg { flex: 1; color: #7d8590; margin: 0 16px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .gh-row-time { font-size: 13px; color: #7d8590; white-space: nowrap; text-align: right; width: 100px; }
        
        /* README AREA */
        .gh-readme { border: 1px solid #30363d; border-radius: 6px; margin-top: 16px; }
        .gh-readme-head { 
            padding: 10px 16px; border-bottom: 1px solid #30363d; background: #000000;
            display: flex; align-items: center; justify-content: space-between;
        }
        .gh-readme-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #e6edf3; }
        .gh-readme-body { padding: 32px; overflow-x: auto; }

        /* SIDEBAR */
        .gh-sidebar h3 { font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #e6edf3; }
        .gh-sidebar-section { border-bottom: 1px solid #21262d; padding-bottom: 24px; margin-bottom: 24px; }
        .gh-topic { display: inline-block; background: rgba(56,139,253,0.15); color: #4493f8; padding: 2px 10px; border-radius: 12px; font-size: 12px; margin: 0 4px 4px 0; font-weight: 500; }
        .gh-stat-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; color: #7d8590; }
        .gh-lang-bar { display: flex; height: 8px; border-radius: 6px; overflow: hidden; margin-bottom: 12px; }
        .gh-lang-item { list-style: none; font-size: 12px; display: flex; align-items: center; gap: 6px; color: #e6edf3; font-weight: 600; margin-bottom: 4px; }
        .gh-lang-item span { color: #7d8590; font-weight: 400; }
        
        /* CONTRIBUTORS SPECIFIC */
        .gh-contributor-list { list-style: none; padding: 0; margin: 0; }
        .gh-contributor-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .gh-avatar-small { width: 32px; height: 32px; border-radius: 50%; background-color: #30363d; object-fit: cover; border: 1px solid #30363d; }
        .gh-username { color: #e6edf3; font-weight: 600; text-decoration: none; font-size: 14px; }
        .gh-username:hover { color: #2f81f7; text-decoration: underline; }
        .gh-description { color: #7d8590; font-size: 14px; margin-left: 4px; }
        .gh-counter-badge { background-color: #21262d; color: #e6edf3; border-radius: 10px; padding: 2px 10px; font-size: 12px; font-weight: 500; border: 1px solid rgba(240,246,252,0.1); margin-left: 8px; display: inline-block; }

      `}</style>

      {/* TABS */}
      <div className="gh-tabs">
        <div
          className={`gh-tab ${activeTab === "work" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("work");
            setActiveBranch("main");
          }}
        >
            <span className="gh-tab-icon"><Icons.Code /></span>
            Work
        </div>
        <div
          className={`gh-tab ${activeTab === "extracurriculars" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("extracurriculars");
            setActiveBranch("main");
          }}
        >
            <span className="gh-tab-icon"><Icons.Star /></span>
            Extracurriculars
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="gh-container">

        {/* LEFT COLUMN */}
        <div className="gh-main">
            
            {/* CONTROL BAR */}
            <div className="gh-controls">
                <div style={{position:'relative'}}>
                    <button className="gh-branch-btn" onClick={toggleBranchDropdown}>
                        <Icons.Branch />
                        {branches[activeBranch]?.name || "all"}
                        <span style={{fontSize:'10px', marginLeft: 4}}>▼</span>
                    </button>
                     {isBranchDropdownOpen && (
                        <div className="gh-dropdown">
                            <div style={{padding:'8px 10px', fontWeight:'600', borderBottom:'1px solid #30363d', fontSize: '12px'}}>Switch branches</div>
                            {Object.keys(branches).map(key => (
                                <div key={key} style={{padding:'8px 16px', borderBottom:'1px solid #21262d', cursor:'pointer', fontSize:'12px'}} onClick={() => selectBranch(key)}>
                                    {key === activeBranch ? <strong>✓ {branches[key].name}</strong> : branches[key].name}
                                </div>
                            ))}
                            <div style={{padding:'8px 16px', cursor:'pointer', fontSize:'12px'}} onClick={() => selectBranch("all")}>View All Tracks</div>
                        </div>
                    )}
                </div>
                <div className="gh-file-actions">
                    <button className="gh-btn">Go to file</button>
                    <button className="gh-btn">Add file <span style={{fontSize:10}}>▼</span></button>
                    <button className="gh-btn-primary" style={{display:'flex', alignItems:'center', gap:6}}>
                        <Icons.Code /> Code <span style={{fontSize:10}}>▼</span>
                    </button>
                </div>
            </div>

            {/* FILE TABLE */}
            <div className="gh-file-box">
                <div className="gh-commit-header">
                    <div className="gh-avatar"></div>
                    <span style={{fontWeight:600, color: '#e6edf3'}}>JonOuyang</span>
                    <span className="gh-commit-msg">Merge pull request #1 from JonOuyang/visual-update</span>
                    <span style={{whiteSpace:'nowrap'}}>0d61de3 · 6 months ago</span>
                    <div style={{display:'flex', gap:4, marginLeft:10}}>
                        <Icons.List />
                        <span>24 commits</span>
                    </div>
                </div>
                <div>
                    {files.map((f, i) => (
                        <div key={i} className="gh-file-row">
                            <div className="gh-row-icon">{f.type === 'folder' ? <Icons.Folder /> : <Icons.File />}</div>
                            <div className="gh-row-name">
                                <a href="#" className="gh-link">{f.name}</a>
                            </div>
                            <div className="gh-row-msg">{f.msg}</div>
                            <div className="gh-row-time">{f.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* README / GRAPH */}
            <div className="gh-readme">
                <div className="gh-readme-head">
                    <div className="gh-readme-title">
                        <Icons.List />
                        README.md
                    </div>
                    <div style={{color:'#7d8590'}}><Icons.Repo /></div>
                </div>
                <div className="gh-readme-body">
                    <h1 style={{borderBottom:'1px solid #21262d', paddingBottom: 8, fontSize: 24, marginBottom: 16, marginTop: 0}}>Work Experience</h1>
                    <p style={{color: '#e6edf3', marginBottom: 30}}>
                        Professional history visualized as a git graph. Toggle branches to explore different tracks.
                    </p>

                    {/* THE GRAPH SVG */}
                    <div style={{width: '100%', overflow: 'hidden'}}>
                         <svg 
                            viewBox={`0 0 ${width} ${height}`} 
                            style={{width: '100%', height: 'auto', display:'block', minHeight: height}}
                        >
                            {/* LANES */}
                            {Object.keys(branches).map((lane) => (
                                <line key={lane}
                                    x1={lanePosition[lane]} x2={lanePosition[lane]}
                                    y1={PADDING/2} y2={height - PADDING/2}
                                    stroke="#21262d" strokeWidth={2} strokeDasharray="6 6"
                                />
                            ))}

                            {/* EDGES */}
                            {filteredEdges.map((edge) => {
                                const from = nodes.find((n) => n.id === edge.from);
                                const to = nodes.find((n) => n.id === edge.to);
                                if (!from || !to) return null;
                                const color = branches[edge.branch]?.color || "#7c3aed";
                                const curvature = 60;
                                const path = `M ${from.x} ${from.y} C ${from.x} ${from.y + curvature}, ${to.x} ${to.y - curvature}, ${to.x} ${to.y}`;
                                return (
                                    <path key={`${edge.from}-${edge.to}`}
                                        d={path} fill="none" stroke={color} strokeWidth={3} opacity={0.8}
                                    />
                                );
                            })}

                            {/* NODES */}
                            {filteredNodes.map((node) => {
                                const ringColor = branches[node.primary]?.color || "#c9d1d9";
                                return (
                                    <g key={node.id}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    style={{ cursor: "pointer" }}>
                                        <circle cx={node.x} cy={node.y} r={5} fill="#000000" stroke={ringColor} strokeWidth={2.5} />
                                        <text x={node.x + 15} y={node.y} dy=".35em" fill="#e6edf3" style={{fontSize: '14px', fontWeight: 600}}>
                                            {node.title}
                                        </text>
                                        <text x={node.x + 15} y={node.y + 18} fill="#7d8590" style={{fontSize: '12px'}}>
                                            {node.date}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                        {/* TOOLTIP */}
                        {hoveredNode && (
                            <div style={{
                                position: 'absolute',
                                left: hoveredNode.x + 20,
                                marginTop: -100, // Adjust based on where you want it relative to the mouse/node
                                background: '#161b22', border: '1px solid #30363d', 
                                padding: '12px', borderRadius: '6px', width: '280px', zIndex: 100,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                            }}>
                                <h4 style={{margin:'0 0 4px 0', color:'#e6edf3'}}>{hoveredNode.company}</h4>
                                <p style={{margin:'0 0 8px 0', color:'#7d8590', fontSize:'12px'}}>{hoveredNode.description}</p>
                                <div style={{display:'flex', gap:4}}>
                                    {hoveredNode.branches.map(b => (
                                        <span key={b} style={{
                                            fontSize:'10px', border:`1px solid ${branches[b]?.color}`,
                                            color: branches[b]?.color, padding:'2px 6px', borderRadius:'10px'
                                        }}>
                                            {branches[b]?.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <div className="gh-sidebar">
            <div className="gh-sidebar-section">
                <h3>About</h3>
                <p style={{fontSize:'14px', color:'#e6edf3', margin:'0 0 16px 0'}}>
                    Visualizing my professional timeline as a git repository.
                </p>
                <div>
                    <span className="gh-topic">react</span>
                    <span className="gh-topic">visualization</span>
                    <span className="gh-topic">portfolio</span>
                </div>
                <div style={{marginTop: 16}}>
                    <div className="gh-stat-row"><Icons.Book /> Readme</div>
                    <div className="gh-stat-row"><Icons.Star /> 12 stars</div>
                    <div className="gh-stat-row"><Icons.Eye /> 2 watching</div>
                    <div className="gh-stat-row"><Icons.Fork /> 0 forks</div>
                </div>
            </div>

            <div className="gh-sidebar-section">
                <h3>Releases</h3>
                <p style={{fontSize:'12px', color:'#7d8590'}}>No releases published</p>
            </div>

            <div className="gh-sidebar-section">
                <h3>Packages</h3>
                <p style={{fontSize:'12px', color:'#7d8590'}}>No packages published</p>
            </div>

            {/* CONTRIBUTORS SECTION (Exact match to screenshot) */}
            <div className="gh-sidebar-section">
                 <h3 style={{display:'flex', alignItems:'center'}}>
                    Contributors <span className="gh-counter-badge">{contributors.length}</span>
                 </h3>
                 <ul className="gh-contributor-list">
                    {contributors.map((c, i) => (
                        <li key={i} className="gh-contributor-item">
                            <img src={c.avatarUrl} alt={c.username} className="gh-avatar-small" />
                            <div>
                                <a href={c.link} className="gh-username">{c.username}</a>
                                <span className="gh-description">{c.description}</span>
                            </div>
                        </li>
                    ))}
                 </ul>
            </div>

            <div className="gh-sidebar-section" style={{border: 'none'}}>
                <h3>Languages</h3>
                <div className="gh-lang-bar">
                    <div style={{width: '70%', backgroundColor: '#3572A5'}}></div>
                    <div style={{width: '25%', backgroundColor: '#f1e05a'}}></div>
                    <div style={{width: '5%', backgroundColor: '#89e051'}}></div>
                </div>
                <ul style={{padding:0, margin:0}}>
                    <li className="gh-lang-item">
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor: '#3572A5'}}></span> Python <span>70%</span>
                    </li>
                    <li className="gh-lang-item">
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor: '#f1e05a'}}></span> JavaScript <span>25%</span>
                    </li>
                    <li className="gh-lang-item">
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor: '#89e051'}}></span> Shell <span>5%</span>
                    </li>
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
};

export default GitHubExperience;