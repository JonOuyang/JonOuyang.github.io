import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllFolders, getRootFiles } from "./workHistoryData"; 

// --- CONFIGURATION ---
const LANE_WIDTH = 50; 
const GRAPH_OFFSET = 35; // Moved slightly right to allow for the 'rail'
const ROW_HEIGHT = 110;  // Generous height for connecting curves
const NODE_RADIUS = 5;

// --- NEON PALETTE (High Contrast) ---
const BRANCH_CONFIG = {
  main: { 
    index: 0, 
    color: "#00f0ff", // Neon Cyan
    name: "main", 
    labelBg: "rgba(0, 240, 255, 0.1)", 
    labelBorder: "#00f0ff" 
  },      
  "ai-ml": { 
    index: 1, 
    color: "#d74cf6", // Neon Pink/Purple
    name: "ai-ml", 
    labelBg: "rgba(215, 76, 246, 0.1)", 
    labelBorder: "#d74cf6" 
  }, 
  swe: { 
    index: 2, 
    color: "#3fb950", // Neon Green
    name: "swe", 
    labelBg: "rgba(63, 185, 80, 0.1)", 
    labelBorder: "#3fb950" 
  },   
};

// --- ICONS ---
const Icons = {
  Branch: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M9.5 3.25a2.25 2.25 0 1 1 3 1.75h-2.25a.75.75 0 0 0-.75.75v2.042a.75.75 0 0 1-.018.164l3.104 3.104a2.25 2.25 0 1 1-1.06 1.06l-3.105-3.105a.75.75 0 0 1-.164-.018V6.5a2.25 2.25 0 1 1 1.243-3.25Zm-4.25-.75a.75.75 0 0 0-.75.75v2.792a.75.75 0 0 0 .018.164l-3.104 3.104a2.25 2.25 0 1 0 1.06 1.06l3.105-3.105a.75.75 0 0 0 .164-.018V3.25a.75.75 0 0 0-.75-.75Zm4.25 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM6 12.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM9.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5.25 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path></svg>,
  Folder: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="#54aeff"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.22 5.54 1 5 1H1.75Z"></path></svg>,
  File: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm7.43 1.78 1.57 1.57L11.063 2H10.5v2.25c0 .138.112.25.25.25h2.25v-.563Z"></path></svg>,
  List: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path></svg>,
  Code: () => <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25Z"></path></svg>,
  Star: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>,
  Eye: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>,
  Fork: () => <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>,
  Book: () => <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path></svg>,
  Repo: () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path></svg>,
};

// --- HELPERS ---
const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
    return Math.abs(hash).toString(16).substring(0, 7);
};

// --- GRAPH ALGORITHM ---
const buildGraph = (experiences) => {
  // 1. Setup Nodes
  const nodes = experiences.map((exp, idx) => {
    // Determine visual column: Prefer 'main', then 'ai-ml', then 'swe'
    let primaryBranch = 'swe';
    if (exp.branches.includes('ai-ml')) primaryBranch = 'ai-ml';
    if (exp.branches.includes('main')) primaryBranch = 'main';

    const config = BRANCH_CONFIG[primaryBranch];
    
    return {
      ...exp,
      id: idx,
      x: GRAPH_OFFSET + (config.index * LANE_WIDTH),
      y: 40 + (idx * ROW_HEIGHT), // Start with some padding
      primaryBranch,
      color: config.color,
      hash: getHash(exp.title + exp.company)
    };
  });

  const edges = [];
  
  // 2. Generate Edges (Lines connecting nodes)
  // We iterate Top-Down (Newest to Oldest).
  // For each node, we look DOWN for the next node that shares a branch.
  
  // Track the last seen node index for each branch
  const lastSeenIndex = { main: null, 'ai-ml': null, swe: null };

  // Traverse Newest -> Oldest to find connections
  nodes.forEach((node) => {
      node.branches.forEach(branchName => {
          // If we have a previous node (visually above) in this branch, connect it?
          // Actually, in Git Graph logic (Newest at Top), the parent is BELOW.
          // So Node(0) connects to Node(1).
          // We need to look "back" or maintain state.
          
          // Let's do it simply:
          // Find the *next* node in the array (index > current) that ALSO has this branch.
          const parentNode = nodes.slice(node.id + 1).find(n => n.branches.includes(branchName));
          
          if (parentNode) {
              edges.push({
                  from: node,      // Child (Newer, Top)
                  to: parentNode,  // Parent (Older, Bottom)
                  branch: branchName,
                  color: BRANCH_CONFIG[branchName].color
              });
          }
      });
  });

  const height = nodes.length * ROW_HEIGHT + 60;
  const width = GRAPH_OFFSET + (3 * LANE_WIDTH) + 20;

  return { nodes, edges, height, width };
};

// "Metro" Path: Straight lines with curved corners
const getPath = (fromX, fromY, toX, toY) => {
    const r = 20; // Radius of curve
    const verticalGap = toY - fromY;
    
    // 1. Same Column (Straight Line)
    if (fromX === toX) {
        return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    // 2. Branching/Merging (Curved)
    // We want the line to start vertical, curve, go horizontal, curve, end vertical.
    // Direction multiplier
    const dir = toX > fromX ? 1 : -1; 
    
    // Visual tweak: "Fork" logic
    // If we are going Top -> Bottom, and changing columns, it usually looks best
    // to drop down a bit, then turn.
    const midY = fromY + (verticalGap * 0.5); 

    return `M ${fromX} ${fromY} 
            L ${fromX} ${midY - r}
            Q ${fromX} ${midY} ${fromX + (r * dir)} ${midY}
            L ${toX - (r * dir)} ${midY}
            Q ${toX} ${midY} ${toX} ${midY + r}
            L ${toX} ${toY}`;
};

const GitHubExperience = ({ workData, extracurricularData, contributors }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("work");
  const [activeBranch, setActiveBranch] = useState("all"); 
  const [isBranchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [expandedNodeId, setExpandedNodeId] = useState(null); 
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentData = activeTab === "work" ? workData : extracurricularData;
  const experiences = currentData.experiences;
  
  const { nodes, edges, width, height } = useMemo(
    () => buildGraph(experiences),
    [experiences]
  );

  const getOpacity = (tags) => {
      if (activeBranch === 'all') return 1;
      // If the node has the tag, full opacity. If not, dim.
      // Exception: Keep 'main' visible as structure if desirable, or dim it too.
      return tags.includes(activeBranch) ? 1 : 0.1;
  };

  const getEdgeOpacity = (branchName) => {
    if (activeBranch === 'all') return 1;
    return branchName === activeBranch ? 1 : 0.05;
  }

  const selectBranch = (key) => {
    setActiveBranch(key);
    setBranchDropdownOpen(false);
  };

  const allFolders = getAllFolders();
  const rootFiles = getRootFiles();

  const files = [
    ...allFolders.map(folder => ({ type: 'folder', name: folder.name, msg: folder.msg, time: folder.date, link: `/work-history/${folder.path}` })),
    ...rootFiles.map(file => ({ type: 'file', name: file.name, msg: file.msg, time: file.date, link: `/work-history/root/${file.name}` }))
  ];

  return (
    <div className="gh-wrapper">
      <style>{`
        .gh-wrapper { background-color: #0d1117; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; width: 100%; min-height: 100vh; }
        .gh-wrapper * { box-sizing: border-box; }
        
        .gh-link { color: #e6edf3; text-decoration: none; font-weight: 600; }
        .gh-link:hover { text-decoration: underline; color: #58a6ff; }

        /* Tabs */
        .gh-tabs { display: flex; gap: 8px; padding: 16px 32px; border-bottom: 1px solid #30363d; background: #010409; }
        .gh-tab { padding: 8px 16px; font-size: 14px; color: #7d8590; border-bottom: 2px solid transparent; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .gh-tab.active { border-bottom-color: #f78166; font-weight: 600; color: #e6edf3; }
        .gh-tab:hover { color: #e6edf3; }
        
        /* Layout */
        .gh-container { display: flex; max-width: 1280px; margin: 0 auto; padding: 24px 32px; gap: 24px; align-items: flex-start; }
        .gh-main { flex: 1; min-width: 0; }
        .gh-sidebar { width: 296px; flex-shrink: 0; }
        @media (max-width: 900px) { .gh-container { flex-direction: column; padding: 16px; } .gh-sidebar { width: 100%; } }

        /* Controls */
        .gh-controls { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .gh-branch-btn { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; padding: 5px 12px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; height: 32px; transition: all 0.2s; }
        .gh-branch-btn:hover { background: #30363d; color: #e6edf3; }
        .gh-dropdown { position: absolute; top: 100%; left: 0; width: 280px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; z-index: 50; margin-top: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }

        /* File Box */
        .gh-file-box { border: 1px solid #30363d; border-radius: 6px; background: #0d1117; margin-bottom: 24px; }
        .gh-commit-header { background: #161b22; padding: 12px 16px; border-bottom: 1px solid #30363d; display: flex; align-items: center; gap: 12px; font-size: 13px; color: #7d8590; border-top-left-radius: 6px; border-top-right-radius: 6px; }
        .gh-file-row { display: flex; align-items: center; padding: 8px 16px; border-top: 1px solid #21262d; font-size: 14px; color: #e6edf3; cursor: pointer; }
        .gh-file-row:hover { background-color: #161b22; text-decoration: none; }
        .gh-file-row:first-of-type { border-top: none; }

        /* GRAPH CONTAINER */
        .gh-readme { border: 1px solid #30363d; border-radius: 6px; margin-top: 16px; background: #0d1117; overflow: hidden; display: flex; flex-direction: column; }
        .gh-readme-head { padding: 10px 16px; border-bottom: 1px solid #30363d; background: #161b22; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; position: sticky; top: 0; z-index: 20; }

        .graph-wrapper { display: flex; position: relative; }
        .graph-svg-container { flex: 0 0 ${width}px; border-right: 1px solid #30363d; background: #0d1117; position: relative; }
        .graph-content-list { flex: 1; min-width: 0; background: #0d1117; }

        /* Commit Rows */
        .exp-row {
            height: ${ROW_HEIGHT}px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 20px;
            border-bottom: 1px solid #21262d; /* Subtle separator */
            cursor: pointer;
            transition: background 0.15s;
        }
        .exp-row:hover { background: rgba(56, 139, 253, 0.05); }
        .exp-row.active { background: rgba(56, 139, 253, 0.1); border-left: 2px solid #58a6ff; padding-left: 18px; }

        .exp-title { font-size: 16px; font-weight: 600; color: #e6edf3; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .exp-meta { font-size: 12px; color: #7d8590; display: flex; align-items: center; gap: 8px; font-family: ui-monospace, SFMono-Regular, monospace; }

        /* Tag Badges */
        .tag-badge {
            font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 12px;
            border: 1px solid transparent; display: inline-block; line-height: 1.2;
        }

        /* Details Pane */
        .exp-details { padding: 20px 24px; background: #161b22; border-bottom: 1px solid #30363d; animation: fadeIn 0.2s ease-out; }
        .markdown-bullet { display: flex; gap: 10px; margin-bottom: 6px; font-size: 14px; line-height: 1.5; color: #e6edf3; }
        .bullet-point { color: #58a6ff; font-weight: bold; user-select: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* TABS */}
      <div className="gh-tabs">
        <div className={`gh-tab ${activeTab === "work" ? "active" : ""}`} onClick={() => { setActiveTab("work"); setActiveBranch("all"); }}>
            <span className="gh-tab-icon"><Icons.Code /></span> Work History
        </div>
        <div className={`gh-tab ${activeTab === "extracurriculars" ? "active" : ""}`} onClick={() => { setActiveTab("extracurriculars"); setActiveBranch("main"); }}>
            <span className="gh-tab-icon"><Icons.Star /></span> Extracurriculars
        </div>
      </div>

      <div className="gh-container">
        <div className="gh-main">
          
          {/* TOP CONTROLS */}
          <div className="gh-controls">
            <div style={{position:'relative'}} ref={dropdownRef}>
                <button className="gh-branch-btn" onClick={() => setBranchDropdownOpen(!isBranchDropdownOpen)}>
                    <Icons.Branch />
                    <span style={{color: BRANCH_CONFIG[activeBranch]?.color || '#c9d1d9'}}>
                        {activeBranch === "all" ? "All Branches" : BRANCH_CONFIG[activeBranch]?.name}
                    </span>
                    <span style={{fontSize:'10px', marginLeft: 4}}>▼</span>
                </button>
                {isBranchDropdownOpen && (
                    <div className="gh-dropdown">
                        <div style={{padding:'8px 12px', fontWeight:'600', borderBottom:'1px solid #30363d', fontSize: '12px', color: '#e6edf3'}}>Switch branches</div>
                        {Object.keys(BRANCH_CONFIG).map(key => (
                            <div key={key} style={{padding:'8px 16px', borderBottom:'1px solid #21262d', cursor:'pointer', fontSize:'12px', color: '#e6edf3', display:'flex', alignItems:'center', gap: 8}} onClick={() => selectBranch(key)}>
                                <div style={{width:8, height:8, borderRadius:'50%', background: BRANCH_CONFIG[key].color}}></div>
                                {key === activeBranch ? <strong>{BRANCH_CONFIG[key].name}</strong> : BRANCH_CONFIG[key].name}
                            </div>
                        ))}
                        <div style={{padding:'8px 16px', cursor:'pointer', fontSize:'12px', color: '#7d8590'}} onClick={() => selectBranch("all")}>Show All</div>
                    </div>
                )}
            </div>
          </div>

          {/* FILE LIST (Mini) */}
          <div className="gh-file-box">
             <div className="gh-commit-header">
                <div style={{width:20, height:20, borderRadius:'50%', background:'#30363d'}}></div>
                <span style={{fontWeight:600, color:'#e6edf3'}}>JonOuyang</span>
                <span style={{marginLeft: 8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%'}}>
                    refactor: optimize graph topology for merge commits
                </span>
                <span style={{marginLeft:'auto', fontFamily:'monospace', fontSize:12, color: '#7d8590'}}>{getHash('latest')}</span>
             </div>
             {files.map((f, i) => (
                <div key={i} className="gh-file-row" onClick={() => f.link && navigate(f.link)}>
                    <div style={{width:24, color: f.type === 'folder' ? '#54aeff' : '#7d8590'}}>{f.type === 'folder' ? <Icons.Folder /> : <Icons.File />}</div>
                    <div style={{flex: '0 0 160px', overflow:'hidden'}}><span className="gh-link">{f.name}</span></div>
                    <div style={{flex: 1, color:'#7d8590', fontSize:13}}>{f.msg}</div>
                    <div style={{fontSize: 12, color: '#7d8590', marginLeft: 12}}>{f.time}</div>
                </div>
             ))}
          </div>

          {/* --- THE GRAPH --- */}
          <div className="gh-readme">
             <div className="gh-readme-head">
                <Icons.List /> README.md <span style={{color:'#7d8590', fontWeight:400, marginLeft:6}}> (Visualized)</span>
             </div>
             
             <div className="graph-wrapper">
                {/* SVG CANVAS */}
                <div className="graph-svg-container">
                    <svg width={width} height={height} style={{display:'block'}}>
                        {/* 1. EDGES (Lines) - Draw first so dots sit on top */}
                        {edges.map((edge, i) => {
                            const d = getPath(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
                            return (
                                <path 
                                    key={`edge-${i}`} 
                                    d={d} 
                                    fill="none" 
                                    stroke={edge.color} 
                                    strokeWidth="2"
                                    opacity={getEdgeOpacity(edge.branch)} 
                                    style={{transition: 'opacity 0.3s'}}
                                />
                            );
                        })}

                        {/* 2. NODES (Dots) */}
                        {nodes.map((node) => {
                            const opacity = getOpacity(node.branches);
                            const isActive = expandedNodeId === node.id;
                            const isMerge = node.branches.length > 1;

                            return (
                                <g key={node.id} 
                                   style={{opacity, transition: 'all 0.3s', cursor: 'pointer'}} 
                                   onClick={() => setExpandedNodeId(expandedNodeId === node.id ? null : node.id)}
                                >
                                    {/* Interaction Target (Invisible larger circle) */}
                                    <circle cx={node.x} cy={node.y} r={15} fill="transparent" />

                                    {/* Active Glow */}
                                    {isActive && <circle cx={node.x} cy={node.y} r={9} fill={node.color} fillOpacity={0.3} />}
                                    
                                    {/* The Dot */}
                                    <circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill="#0d1117" stroke={node.color} strokeWidth="2.5" />
                                    
                                    {/* Inner dot for Merges (GitKraken style) */}
                                    {isMerge && <circle cx={node.x} cy={node.y} r={2} fill={node.color} />}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* CONTENT LIST */}
                <div className="graph-content-list">
                    {nodes.map((node) => (
                        <div key={node.id}>
                            <div 
                                className={`exp-row ${expandedNodeId === node.id ? 'active' : ''}`}
                                onClick={() => setExpandedNodeId(expandedNodeId === node.id ? null : node.id)}
                                style={{ opacity: getOpacity(node.branches) }}
                            >
                                <div className="exp-title">
                                    {node.title}
                                    {/* Badges for every branch this commit touches */}
                                    {node.branches.map(b => (
                                        <span key={b} className="tag-badge" 
                                              style={{
                                                color: BRANCH_CONFIG[b].color, 
                                                background: BRANCH_CONFIG[b].labelBg,
                                                border: `1px solid ${BRANCH_CONFIG[b].labelBorder}`
                                              }}>
                                            {BRANCH_CONFIG[b].name}
                                        </span>
                                    ))}
                                </div>
                                <div className="exp-meta">
                                    <span style={{color: node.color}}>{node.hash}</span>
                                    <span style={{fontWeight:600, color:'#e6edf3'}}>{node.company}</span>
                                    <span>•</span>
                                    <span>{node.date}</span>
                                </div>
                            </div>

                            {expandedNodeId === node.id && (
                                <div className="exp-details">
                                    <div className="markdown-bullet" style={{marginBottom:12, fontStyle:'italic', color:'#7d8590'}}>
                                        {/* Dynamic commit message style header */}
                                        Merge {node.branches.join(' & ')} history at {node.company}
                                    </div>
                                    <div className="markdown-body">
                                        {node.bullets ? node.bullets.map((bullet, i) => (
                                            <div key={i} className="markdown-bullet">
                                                <span className="bullet-point" style={{color: node.color}}>+</span>
                                                <span>{bullet}</span>
                                            </div>
                                        )) : (
                                            <div style={{fontStyle:'italic', color:'#7d8590'}}>No detailed description provided.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="gh-sidebar">
           <div style={{borderBottom:'1px solid #30363d', paddingBottom: 24, marginBottom: 24}}>
              <h3 style={{fontSize:16, fontWeight:600, color:'#e6edf3', margin:'0 0 12px 0'}}>About</h3>
              <p style={{fontSize:14, color:'#e6edf3', lineHeight:'1.5', margin:'0 0 16px 0'}}>
                  Visualizing my professional timeline as a git repository.
              </p>
              <div>
                  <span style={{display:'inline-block', background:'rgba(56,139,253,0.15)', color:'#4493f8', padding:'2px 10px', borderRadius:12, fontSize:12, margin:'0 4px 4px 0', fontWeight:500}}>react</span>
                  <span style={{display:'inline-block', background:'rgba(56,139,253,0.15)', color:'#4493f8', padding:'2px 10px', borderRadius:12, fontSize:12, margin:'0 4px 4px 0', fontWeight:500}}>visualization</span>
                  <span style={{display:'inline-block', background:'rgba(56,139,253,0.15)', color:'#4493f8', padding:'2px 10px', borderRadius:12, fontSize:12, margin:'0 4px 4px 0', fontWeight:500}}>portfolio</span>
              </div>
              <div style={{marginTop: 16}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#7d8590'}}><Icons.Book /> Readme</div>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#7d8590'}}><Icons.Star /> 12 stars</div>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#7d8590'}}><Icons.Eye /> 2 watching</div>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#7d8590'}}><Icons.Fork /> 0 forks</div>
              </div>
           </div>

           <div style={{borderBottom:'1px solid #30363d', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#e6edf3', margin:'0 0 12px 0'}}>Releases</h3>
               <p style={{fontSize:12, color:'#7d8590', margin:0}}>No releases published</p>
           </div>

           <div style={{borderBottom:'1px solid #30363d', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#e6edf3', margin:'0 0 12px 0'}}>Packages</h3>
               <p style={{fontSize:12, color:'#7d8590', margin:0}}>No packages published</p>
           </div>

           <div style={{borderBottom:'1px solid #30363d', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#e6edf3', margin:'0 0 12px 0', display:'flex', alignItems:'center'}}>
                   Contributors <span style={{backgroundColor:'#21262d', color:'#e6edf3', borderRadius:10, padding:'2px 8px', fontSize:12, fontWeight:500, border:'1px solid #30363d', marginLeft:8}}>{contributors.length}</span>
               </h3>
               <ul style={{listStyle:'none', padding:0, margin:0}}>
                  {contributors.map((c, i) => (
                      <li key={i} style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                          <img src={c.avatarUrl} alt={c.username} style={{width:32, height:32, borderRadius:'50%', border:'1px solid #30363d', objectFit:'cover'}} />
                          <div>
                              <a href={c.link} style={{color:'#e6edf3', fontWeight:600, textDecoration:'none', fontSize:14}}>{c.username}</a>
                              <div style={{fontSize:12, color:'#7d8590'}}>{c.description}</div>
                          </div>
                      </li>
                  ))}
               </ul>
           </div>

           <div style={{border:'none'}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#e6edf3', margin:'0 0 12px 0'}}>Languages</h3>
               <div style={{display:'flex', height:8, borderRadius:6, overflow:'hidden', marginBottom:12}}>
                    <div style={{width: '70%', backgroundColor: '#3572A5'}}></div>
                    <div style={{width: '25%', backgroundColor: '#f1e05a'}}></div>
                    <div style={{width: '5%', backgroundColor: '#89e051'}}></div>
               </div>
               <ul style={{listStyle:'none', padding:0, margin:0}}>
                    <li style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, fontSize:12}}>
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor:'#3572A5'}}></span> <span style={{color:'#e6edf3', fontWeight:600}}>Python</span> <span style={{color:'#7d8590', fontWeight:400}}>70%</span>
                    </li>
                    <li style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, fontSize:12}}>
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor:'#f1e05a'}}></span> <span style={{color:'#e6edf3', fontWeight:600}}>JavaScript</span> <span style={{color:'#7d8590', fontWeight:400}}>25%</span>
                    </li>
                    <li style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, fontSize:12}}>
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor:'#89e051'}}></span> <span style={{color:'#e6edf3', fontWeight:600}}>Shell</span> <span style={{color:'#7d8590', fontWeight:400}}>5%</span>
                    </li>
               </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubExperience;