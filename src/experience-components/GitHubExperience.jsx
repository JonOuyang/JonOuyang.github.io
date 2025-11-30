import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllFolders, getRootFiles } from "./workHistoryData";

// --- CONFIGURATION ---
const LANE_WIDTH = 50; 
const GRAPH_OFFSET = 35; // Moved slightly right to allow for the 'rail'
const ROW_HEIGHT = 110;  // Generous height for connecting curves
const NODE_RADIUS = 5;

// --- BRANCH PALETTE (Void/Cybernetic Theme) ---
const BRANCH_CONFIG = {
  main: {
    index: 0,
    color: "#818CF8", // Periwinkle - Matches Site Theme
    name: "main",
    labelBg: "transparent",
    labelBorder: "#818CF8"
  },
  "ai-ml": {
    index: 1,
    color: "#E879F9", // Fuchsia - Complimentary
    name: "ai-ml",
    labelBg: "transparent",
    labelBorder: "#E879F9"
  },
  swe: {
    index: 2,
    color: "#22D3EE", // Cyan - High Contrast
    name: "swe",
    labelBg: "transparent",
    labelBorder: "#22D3EE"
  },
};

// --- ICONS (Official GitHub Octicons) ---
const Icons = {
  Branch: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
    </svg>
  ),
  Folder: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#D4D4D8" className="file-icon">
      <path d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h3.5c.55 0 1.07.26 1.4.7l.9 1.2a.25.25 0 0 0 .2.1h6.5a1.75 1.75 0 0 1 1.75 1.75v8a1.75 1.75 0 0 1-1.75 1.75h-13A1.75 1.75 0 0 1 0 12.75v-10c0-.464.184-.909.513-1.237Z"></path>
    </svg>
  ),
  File: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#D4D4D8" className="file-icon">
      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"></path>
    </svg>
  ),
  List: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM3 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path>
    </svg>
  ),
  Code: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"></path>
    </svg>
  ),
  Star: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
    </svg>
  ),
  Eye: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"></path>
    </svg>
  ),
  Fork: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
    </svg>
  ),
  Book: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"></path>
    </svg>
  ),
  Repo: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
    </svg>
  ),
};

// --- HELPERS ---
const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
    return Math.abs(hash).toString(16).substring(0, 7);
};

// --- GRAPH ALGORITHM ---
const buildGraph = (experiences) => {
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
      y: 45 + (idx * ROW_HEIGHT), // Start with some padding, shifted down for better alignment
      primaryBranch,
      color: config.color,
      hash: getHash(exp.title + exp.company),
      branchTitles: exp.branchTitles // Include branch-specific titles if available
    };
  });

  const edges = [];

  // Generate Edges: Iterate Top-Down (Newest to Oldest)
  // For each node, we look DOWN for the next node that shares a branch.

  // Track the last seen node index for each branch
  const lastSeenIndex = { main: null, 'ai-ml': null, swe: null };

  nodes.forEach((node) => {
      node.branches.forEach(branchName => {
          // In Git Graph logic (Newest at Top), the parent is BELOW.
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

    // Same Column (Straight Line)
    if (fromX === toX) {
        return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    // Branching/Merging (Curved)
    // Line starts vertical, curves, goes horizontal, curves, ends vertical
    // Direction multiplier
    const dir = toX > fromX ? 1 : -1;

    // Visual tweak: "Fork" logic - drop down before turning for better aesthetics
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
      // If the node has the active branch tag, full opacity
      if (tags.includes(activeBranch)) return 1;
      // Special case for 'main': show all nodes since main is the full timeline
      if (activeBranch === 'main') return 1;
      return 0.1;
  };

  const getEdgeOpacity = (branchName) => {
    if (activeBranch === 'all') return 1;
    // Special case for 'main': show all edges with full opacity
    if (activeBranch === 'main') return 1;
    return branchName === activeBranch ? 1 : 0.05;
  }

  const getDisplayTitle = (node) => {
    // If the node has branch-specific titles
    if (node.branchTitles) {
      // If filtering by a specific branch (not 'all'), use that branch's title
      if (activeBranch !== 'all' && node.branchTitles[activeBranch]) {
        return node.branchTitles[activeBranch];
      }
      // For 'all' or 'main', use the primary branch's title
      if (node.branchTitles[node.primaryBranch]) {
        return node.branchTitles[node.primaryBranch];
      }
    }
    // Fallback to default title
    return node.title;
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
        /* Agent Gradient Variable */
        :root {
          --agent-gradient: linear-gradient(to right, #818CF8, #A78BFA);
        }

        .gh-wrapper { background-color: #000000; color: #A1A1AA; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; width: 100%; min-height: 100vh; }
        .gh-wrapper * { box-sizing: border-box; }

        .gh-link { color: #FFFFFF; text-decoration: none; font-weight: 600; }
        .gh-link:hover { text-decoration: underline; }

        /* Tabs */
        .gh-tabs { display: flex; gap: 8px; padding: 16px 32px; border-bottom: 1px solid #27272A; background: #000000; }
        .gh-tab { padding: 8px 16px; font-size: 14px; color: #A1A1AA; border-bottom: 2px solid transparent; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .gh-tab.active { border-bottom-color: #A78BFA; font-weight: 600; color: #FFFFFF; }
        .gh-tab:hover { color: #FFFFFF; background: var(--agent-gradient); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        /* Layout */
        .gh-container { display: flex; max-width: 1280px; margin: 0 auto; padding: 24px 32px; gap: 24px; align-items: flex-start; }
        .gh-main { flex: 1; min-width: 0; }
        .gh-sidebar { width: 296px; flex-shrink: 0; }
        @media (max-width: 900px) { .gh-container { flex-direction: column; padding: 16px; } .gh-sidebar { width: 100%; } }

        /* Controls */
        .gh-controls { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .gh-branch-btn { background: transparent; border: 1px solid #27272A; color: #A1A1AA; border-radius: 6px; padding: 5px 12px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; height: 32px; transition: all 0.2s; }
        .gh-branch-btn:hover { background: rgba(129, 140, 248, 0.1); border-color: #818CF8; color: #FFFFFF; }
        .gh-dropdown { position: absolute; top: 100%; left: 0; width: 280px; background: #050505; border: 1px solid #27272A; border-radius: 6px; z-index: 50; margin-top: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.8); }

        /* File Box */
        .gh-file-box { border: 1px solid #27272A; border-radius: 6px; background: transparent; margin-bottom: 24px; }
        .gh-commit-header { background: #050505; padding: 12px 16px; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 12px; font-size: 13px; color: #A1A1AA; border-top-left-radius: 6px; border-top-right-radius: 6px; }
        .gh-file-row { display: flex; align-items: center; padding: 8px 16px; border-top: 1px solid #27272A; font-size: 14px; color: #FFFFFF; cursor: pointer; }
        .gh-file-row:hover { background-color: rgba(129, 140, 248, 0.05); text-decoration: none; }
        .gh-file-row:hover .file-icon { fill: #A78BFA; transition: fill 0.2s; }
        .gh-file-row:first-of-type { border-top: none; }
        .file-icon { transition: fill 0.2s; }

        /* GRAPH CONTAINER */
        .gh-readme { border: 1px solid #27272A; border-radius: 6px; margin-top: 16px; background: transparent; overflow: hidden; display: flex; flex-direction: column; }
        .gh-readme-head { padding: 10px 16px; border-bottom: 1px solid #27272A; background: #050505; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; position: sticky; top: 0; z-index: 20; color: #FFFFFF; }

        .graph-wrapper { display: flex; position: relative; }
        .graph-svg-container { flex: 0 0 ${width}px; background: #000000; position: relative; }
        .graph-content-list { flex: 1; min-width: 0; background: #000000; position: relative; }

        /* Commit Rows */
        .exp-row {
            height: ${ROW_HEIGHT}px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 20px;
            cursor: pointer;
            transition: background 0.15s;
            position: relative;
        }
        .exp-row:hover { background: rgba(129, 140, 248, 0.05); }
        .exp-row.active { background: rgba(167, 139, 250, 0.1); border-left: 2px solid #A78BFA; padding-left: 18px; }

        .exp-title { font-size: 16px; font-weight: 600; color: #FFFFFF; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .exp-meta { font-size: 12px; color: #A1A1AA; display: flex; align-items: center; gap: 8px; font-family: ui-monospace, SFMono-Regular, monospace; }

        /* Tag Badges - Transparent Pills with Colored Borders */
        .tag-badge {
            font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
            border: 1px solid; display: inline-block; line-height: 1.2; background: transparent;
        }

        /* Details Pane */
        .exp-details { padding: 20px 24px; background: #050505; border-bottom: 1px solid #27272A; animation: fadeIn 0.2s ease-out; }
        .markdown-bullet { display: flex; gap: 10px; margin-bottom: 6px; font-size: 14px; line-height: 1.5; color: #A1A1AA; }
        .bullet-point { color: #818CF8; font-weight: bold; user-select: none; }
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
                    <span style={{color: '#FFFFFF'}}>
                        {activeBranch === "all" ? "All Branches" : BRANCH_CONFIG[activeBranch]?.name}
                    </span>
                    <span style={{fontSize:'10px', marginLeft: 4}}>▼</span>
                </button>
                {isBranchDropdownOpen && (
                    <div className="gh-dropdown">
                        <div style={{padding:'8px 12px', fontWeight:'600', borderBottom:'1px solid #27272A', fontSize: '12px', color: '#FFFFFF'}}>Switch branches</div>
                        {Object.keys(BRANCH_CONFIG).map(key => (
                            <div key={key} style={{padding:'8px 16px', borderBottom:'1px solid #27272A', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', gap: 8}} onClick={() => selectBranch(key)}>
                                <div style={{width:8, height:8, borderRadius:'50%', background: BRANCH_CONFIG[key].color}}></div>
                                <span style={{color: '#FFFFFF'}}>{key === activeBranch ? <strong>{BRANCH_CONFIG[key].name}</strong> : BRANCH_CONFIG[key].name}</span>
                            </div>
                        ))}
                        <div style={{padding:'8px 16px', cursor:'pointer', fontSize:'12px', color: '#A1A1AA'}} onClick={() => selectBranch("all")}>Show All</div>
                    </div>
                )}
            </div>
            <div style={{display:'flex', gap:8, marginLeft:'auto'}}>
                <button className="gh-branch-btn">Go to file</button>
                <button className="gh-branch-btn">Add file <span style={{fontSize:'10px', marginLeft:4}}>▼</span></button>
                <button className="gh-branch-btn" style={{background: 'linear-gradient(to right, #818CF8, #A78BFA)', borderColor: 'transparent', color: '#FFFFFF'}}>
                    <Icons.Code /> Code <span style={{fontSize:'10px', marginLeft:4}}>▼</span>
                </button>
            </div>
          </div>

          {/* FILE LIST (Mini) */}
          <div className="gh-file-box">
             <div className="gh-commit-header">
                <div style={{width:20, height:20, borderRadius:'50%', background:'#27272A'}}></div>
                <span style={{fontWeight:600, color:'#FFFFFF'}}>JonOuyang</span>
                <span style={{marginLeft: 8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%', color:'#A1A1AA'}}>
                    refactor: optimize graph topology for merge commits
                </span>
                <span style={{marginLeft:'auto', fontFamily:'monospace', fontSize:12, color: '#818CF8'}}>{getHash('latest')}</span>
             </div>
             {files.map((f, i) => (
                <div key={i} className="gh-file-row" onClick={() => f.link && navigate(f.link)}>
                    <div style={{width:24}}>{f.type === 'folder' ? <Icons.Folder /> : <Icons.File />}</div>
                    <div style={{flex: '0 0 200px', overflow:'hidden'}}><span className="gh-link">{f.name}</span></div>
                    <div style={{flex: '0 0 350px', color:'#A1A1AA', fontSize:13, marginLeft: '20%'}}>{f.msg}</div>
                    <div style={{fontSize: 12, color: '#A1A1AA', marginLeft: 'auto'}}>{f.time}</div>
                </div>
             ))}
          </div>

          {/* --- THE GRAPH --- */}
          <div className="gh-readme">
             <div className="gh-readme-head">
                <Icons.List /> README.md <span style={{color:'#A1A1AA', fontWeight:400, marginLeft:6}}> (Visualized)</span>
             </div>
             
             <div className="graph-wrapper">
                {/* SVG CANVAS */}
                <div className="graph-svg-container">
                    <svg width={width} height={height} style={{display:'block'}}>
                        {/* SVG Filters for Glowing Effect */}
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                            <linearGradient id="laserGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#818CF8', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: '#A78BFA', stopOpacity: 1}} />
                            </linearGradient>
                        </defs>

                        {/* EDGES (Lines) - Draw first so dots sit on top */}
                        {/* Sort: rightmost branches first (lowest layer), main branch last (top layer) */}
                        {[...edges]
                            .sort((a, b) => {
                                // Higher index = drawn first = lower layer; Lower index = drawn last = top layer
                                const indexA = BRANCH_CONFIG[a.branch].index;
                                const indexB = BRANCH_CONFIG[b.branch].index;
                                return indexB - indexA;
                            })
                            .map((edge, i) => {
                                const d = getPath(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
                                const edgeColor = edge.branch === 'main' ? BRANCH_CONFIG.main.color : edge.color;
                                return (
                                    <path
                                        key={`edge-${i}`}
                                        d={d}
                                        fill="none"
                                        stroke={edgeColor}
                                        strokeWidth="2"
                                        opacity={getEdgeOpacity(edge.branch)}
                                        style={{transition: 'opacity 0.3s'}}
                                    />
                                );
                            })}

                        {/* HORIZONTAL CONNECTOR LINES */}
                        {nodes.map((node) => {
                            const opacity = getOpacity(node.branches);
                            return (
                                <line
                                    key={`connector-${node.id}`}
                                    x1={node.x}
                                    y1={node.y}
                                    x2={width}
                                    y2={node.y}
                                    stroke="rgba(39, 39, 42, 0.3)"
                                    strokeWidth="1"
                                    opacity={opacity}
                                    style={{transition: 'opacity 0.3s'}}
                                />
                            );
                        })}

                        {/* NODES (Dots) */}
                        {nodes.map((node) => {
                            const opacity = getOpacity(node.branches);
                            const isActive = expandedNodeId === node.id;
                            const isMerge = node.branches.length > 1;

                            // Use active branch color if specific branch selected (except 'main' and 'all')
                            const displayColor = activeBranch !== 'all' && activeBranch !== 'main' && node.branches.includes(activeBranch)
                                ? BRANCH_CONFIG[activeBranch].color
                                : node.color;

                            return (
                                <g key={node.id}
                                   style={{opacity, transition: 'all 0.3s', cursor: 'pointer'}}
                                   onClick={() => setExpandedNodeId(expandedNodeId === node.id ? null : node.id)}
                                >
                                    <circle cx={node.x} cy={node.y} r={15} fill="transparent" />
                                    {isActive && <circle cx={node.x} cy={node.y} r={9} fill={displayColor} fillOpacity={0.3} />}
                                    <circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill="#000000" stroke={displayColor} strokeWidth="2.5" />

                                    {isMerge && <circle cx={node.x} cy={node.y} r={2} fill={displayColor} />}
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
                                    {getDisplayTitle(node)}
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
                                    <span style={{color: '#818CF8', fontFamily: 'ui-monospace, SFMono-Regular, monospace'}}>{node.hash}</span>
                                    <span style={{fontWeight:600, color:'#FFFFFF'}}>{node.company}</span>
                                    <span>•</span>
                                    <span>{node.date}</span>
                                </div>
                            </div>

                            {expandedNodeId === node.id && (
                                <div className="exp-details">
                                    <div className="markdown-bullet" style={{marginBottom:12, fontStyle:'italic', color:'#A1A1AA'}}>
                                        Merge {node.branches.join(' & ')} history at {node.company}
                                    </div>
                                    <div className="markdown-body">
                                        {node.bullets ? node.bullets.map((bullet, i) => (
                                            <div key={i} className="markdown-bullet">
                                                <span className="bullet-point">+</span>
                                                <span>{bullet}</span>
                                            </div>
                                        )) : (
                                            <div style={{fontStyle:'italic', color:'#A1A1AA'}}>No detailed description provided.</div>
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
           <div style={{borderBottom:'1px solid #27272A', paddingBottom: 24, marginBottom: 24}}>
              <h3 style={{fontSize:16, fontWeight:600, color:'#FFFFFF', margin:'0 0 12px 0'}}>About</h3>
              <p style={{fontSize:14, color:'#A1A1AA', lineHeight:'1.5', margin:'0 0 16px 0'}}>
                  Visualizing my professional timeline as a git repository.
              </p>
              <div>
                  <span style={{display:'inline-block', background:'transparent', color:'#818CF8', padding:'2px 10px', borderRadius:999, border:'1px solid #818CF8', fontSize:12, margin:'0 4px 4px 0', fontWeight:500}}>react</span>
                  <span style={{display:'inline-block', background:'transparent', color:'#A78BFA', padding:'2px 10px', borderRadius:999, border:'1px solid #A78BFA', fontSize:12, margin:'0 4px 4px 0', fontWeight:500}}>visualization</span>
                  <span style={{display:'inline-block', background:'transparent', color:'#818CF8', padding:'2px 10px', borderRadius:999, border:'1px solid #818CF8', fontSize:12, margin:'0 4px 4px 0', fontWeight:500}}>portfolio</span>
              </div>
              <div style={{marginTop: 16}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#A1A1AA'}}><Icons.Book /> Readme</div>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#A1A1AA'}}><Icons.Star /> 12 stars</div>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#A1A1AA'}}><Icons.Eye /> 2 watching</div>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#A1A1AA'}}><Icons.Fork /> 0 forks</div>
              </div>
           </div>

           <div style={{borderBottom:'1px solid #27272A', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#FFFFFF', margin:'0 0 12px 0'}}>Releases</h3>
               <p style={{fontSize:12, color:'#A1A1AA', margin:0}}>No releases published</p>
           </div>

           <div style={{borderBottom:'1px solid #27272A', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#FFFFFF', margin:'0 0 12px 0'}}>Packages</h3>
               <p style={{fontSize:12, color:'#A1A1AA', margin:0}}>No packages published</p>
           </div>

           <div style={{borderBottom:'1px solid #27272A', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#FFFFFF', margin:'0 0 12px 0', display:'flex', alignItems:'center'}}>
                   Contributors <span style={{backgroundColor:'transparent', color:'#A1A1AA', borderRadius:10, padding:'2px 8px', fontSize:12, fontWeight:500, border:'1px solid #27272A', marginLeft:8}}>{contributors.length}</span>
               </h3>
               <ul style={{listStyle:'none', padding:0, margin:0}}>
                  {contributors.map((c, i) => (
                      <li key={i} style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                          <img src={c.avatarUrl} alt={c.username} style={{width:32, height:32, borderRadius:'50%', border:'1px solid #27272A', objectFit:'cover'}} />
                          <div>
                              <a href={c.link} style={{color:'#FFFFFF', fontWeight:600, textDecoration:'none', fontSize:14}}>{c.username}</a>
                              <div style={{fontSize:12, color:'#A1A1AA'}}>{c.description}</div>
                          </div>
                      </li>
                  ))}
               </ul>
           </div>

           <div style={{border:'none'}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#FFFFFF', margin:'0 0 12px 0'}}>Languages</h3>
               <div style={{display:'flex', height:8, borderRadius:6, overflow:'hidden', marginBottom:12}}>
                    <div style={{width: '70%', backgroundColor: '#3572A5'}}></div>
                    <div style={{width: '25%', backgroundColor: '#f1e05a'}}></div>
                    <div style={{width: '5%', backgroundColor: '#89e051'}}></div>
               </div>
               <ul style={{listStyle:'none', padding:0, margin:0}}>
                    <li style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, fontSize:12}}>
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor:'#3572A5'}}></span> <span style={{color:'#FFFFFF', fontWeight:600}}>Python</span> <span style={{color:'#A1A1AA', fontWeight:400}}>70%</span>
                    </li>
                    <li style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, fontSize:12}}>
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor:'#f1e05a'}}></span> <span style={{color:'#FFFFFF', fontWeight:600}}>JavaScript</span> <span style={{color:'#A1A1AA', fontWeight:400}}>25%</span>
                    </li>
                    <li style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, fontSize:12}}>
                        <span style={{width:8, height:8, borderRadius:'50%', backgroundColor:'#89e051'}}></span> <span style={{color:'#FFFFFF', fontWeight:600}}>Shell</span> <span style={{color:'#A1A1AA', fontWeight:400}}>5%</span>
                    </li>
               </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubExperience;