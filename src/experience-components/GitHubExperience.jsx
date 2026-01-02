import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- CONFIGURATION ---
const DEFAULT_GRAPH_CONFIG = {
  laneWidth: 50,
  graphOffset: 35, // Moved slightly right to allow for the 'rail'
  rowHeight: 110, // Generous height for connecting curves
  nodeRadius: 5,
  curveRadius: 20,
};

const getGraphConfig = (compact) =>
  compact
    ? {
        laneWidth: 20,
        graphOffset: 10,
        rowHeight: 86,
        nodeRadius: 2.5,
        curveRadius: 10,
      }
    : DEFAULT_GRAPH_CONFIG;

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
  // Added for Extracurriculars
  leadership: {
    index: 1,
    color: "#E879F9", // Reusing Fuchsia
    name: "leadership",
    labelBg: "transparent",
    labelBorder: "#E879F9"
  },
  tech: {
    index: 2,
    color: "#22D3EE", // Reusing Cyan
    name: "tech",
    labelBg: "transparent",
    labelBorder: "#22D3EE"
  }
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
  Search: () => (
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
      <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 1 1-1.06 1.06l-3.04-3.04ZM11.5 7a4.5 4.5 0 1 0-9.001 0A4.5 4.5 0 0 0 11.5 7Z"></path>
    </svg>
  ),
};

// --- HELPERS ---
const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
    return Math.abs(hash).toString(16).substring(0, 7);
};

const encodePathSegment = (value) =>
  encodeURIComponent(value).replaceAll(".", "%2E");

// --- GRAPH ALGORITHM ---
const buildGraph = (experiences, graphConfig) => {
  const { laneWidth, graphOffset, rowHeight } = graphConfig;
  const nodes = experiences.map((exp, idx) => {
    // Determine visual column: Prefer 'main', then 'ai-ml'/'leadership', then 'swe'/'tech'
    let primaryBranch;
    
    // Priority: main > ai-ml/leadership (col 1) > swe/tech (col 2)
    // This priority ensures that if an item is on multiple branches, it snaps to the "trunk-iest" one available.
    if (exp.branches.includes('main')) {
        primaryBranch = 'main';
    } else if (exp.branches.includes('ai-ml')) {
        primaryBranch = 'ai-ml';
    } else if (exp.branches.includes('leadership')) {
        primaryBranch = 'leadership';
    } else if (exp.branches.includes('swe')) {
        primaryBranch = 'swe';
    } else if (exp.branches.includes('tech')) {
        primaryBranch = 'tech';
    } else {
        primaryBranch = exp.branches[0] || 'main'; // Fallback
    }

    const config = BRANCH_CONFIG[primaryBranch] || BRANCH_CONFIG['main'];
    
    return {
      ...exp,
      id: idx,
      x: graphOffset + (config.index * laneWidth),
      y: (rowHeight / 2) + (idx * rowHeight), // Align node with row center
      primaryBranch,
      color: config.color,
      hash: getHash(exp.title + exp.company),
      branchTitles: exp.branchTitles // Include branch-specific titles if available
    };
  });

  const edges = [];

  // Generate Edges: Iterate Top-Down (Newest to Oldest)
  // For each node, we look DOWN for the next node that shares a branch.

  nodes.forEach((node) => {
      node.branches.forEach(branchName => {
          // In Git Graph logic (Newest at Top), the parent is BELOW.
          // Find the *next* node in the array (index > current) that ALSO has this branch.
          const parentNode = nodes.slice(node.id + 1).find(n => n.branches.includes(branchName));
          
          if (parentNode) {
              const branchConfig = BRANCH_CONFIG[branchName];
              if (branchConfig) {
                  edges.push({
                      from: node,      // Child (Newer, Top)
                      to: parentNode,  // Parent (Older, Bottom)
                      branch: branchName,
                      color: branchConfig.color
                  });
              }
          }
      });
  });

  const height = nodes.length * rowHeight + (rowHeight < 100 ? 20 : 60);
  const width = graphOffset + (3 * laneWidth) + 20;

  return { nodes, edges, height, width };
};

// "Metro" Path: Straight lines with curved corners
const getPath = (fromX, fromY, toX, toY, curveRadius = 20) => {
    const r = curveRadius; // Radius of curve
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

const GitHubExperience = () => {
  const navigate = useNavigate();
  const [isCompact, setIsCompact] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [activeTab, setActiveTab] = useState("work");
  const [activeBranch, setActiveBranch] = useState("all"); 
  const [isBranchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [isCodeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [activeCloneMethod, setActiveCloneMethod] = useState("https");
  const [hoveredContext, setHoveredContext] = useState(null);
  const [expandedNodeId, setExpandedNodeId] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [isGoToFileOpen, setGoToFileOpen] = useState(false);
  const [goToQuery, setGoToQuery] = useState("");
  const goToInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [workData, setWorkData] = useState({ experiences: [], branches: {} });
  const [extracurricularData, setExtracurricularData] = useState({ experiences: [], branches: {} });
  const [contributors, setContributors] = useState([]);
  const [workHistory, setWorkHistory] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setBranchDropdownOpen(false);
        setCodeDropdownOpen(false);
        setGoToFileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClearSelection = (event) => {
      if (event.target.closest('.exp-row, .exp-details')) return;
      setExpandedNodeId(null);
      setHoveredContext(null);
    };
    document.addEventListener('mousedown', handleClearSelection);
    return () => document.removeEventListener('mousedown', handleClearSelection);
  }, []);

  useEffect(() => {
    if (isGoToFileOpen && goToInputRef.current) {
      goToInputRef.current.focus();
    }
  }, [isGoToFileOpen]);

  // Load data from public/data
  useEffect(() => {
    const load = async () => {
      try {
        const [workResp, extraResp, contribResp, whResp] = await Promise.all([
          fetch("/data/experiences.json"),
          fetch("/data/extracurriculars.json"),
          fetch("/data/contributors.json"),
          fetch("/data/workHistory.json")
        ]);

        if (workResp.ok) {
          const json = await workResp.json();
          setWorkData({ experiences: json.experiences || [], branches: json.branches || {} });
        }
        if (extraResp.ok) {
          const json = await extraResp.json();
          setExtracurricularData({ experiences: json.experiences || [], branches: json.branches || {} });
        }
        if (contribResp.ok) {
          const json = await contribResp.json();
          setContributors(json.contributors || []);
        }
        if (whResp.ok) {
          const json = await whResp.json();
          setWorkHistory(json);
        }
      } catch (err) {
        console.error("Failed to load experience data", err);
      }
    };
    load();
  }, []);

  const currentData = activeTab === "work" ? workData : extracurricularData;
  const experiences = currentData.experiences;
  
  const graphConfig = useMemo(() => getGraphConfig(isCompact), [isCompact]);
  const { nodes, edges, width, height } = useMemo(
    () => buildGraph(experiences, graphConfig),
    [experiences, graphConfig]
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

  const matchesContext = (value, context) => {
    if (!context) return false;
    return String(value).toLowerCase() === String(context).toLowerCase();
  };

  const copyToClipboard = (value) => {
    if (!value) return;
    navigator.clipboard.writeText(value).catch(() => {});
  };

  const cloneUrls = {
    https: "https://github.com/JonOuyang/JonOuyang.github.io.git",
    ssh: "git@github.com:JonOuyang/JonOuyang.github.io.git",
    cli: "gh repo clone JonOuyang/JonOuyang.github.io",
  };

  const getAllFolders = () => {
    if (!workHistory?.folders) return [];
    return Object.values(workHistory.folders).map(folder => ({
      ...folder,
      readme: workHistory.javascriptReadme
    }));
  };

  const getRootFiles = () => {
    if (!workHistory?.rootFiles) return [];
    // inject README content
    return workHistory.rootFiles.map(file => {
      if (file.name === "README.md") {
        return { ...file, content: workHistory.mainReadme, type: "markdown" };
      }
      return file;
    });
  };

  const allFolders = getAllFolders();
  const rootFiles = getRootFiles();

  const files = [
    ...allFolders.map(folder => ({ type: 'folder', name: folder.name, msg: folder.msg, time: folder.date, link: `/work-history/${encodePathSegment(folder.path)}` })),
    ...rootFiles.map(file => ({
      type: 'file',
      name: file.name,
      msg: file.msg,
      time: file.date,
      link: `/work-history/root/${encodePathSegment(file.name)}`
    }))
  ];

  const goToItems = files
    .map((item) => ({
      ...item,
      label: item.type === 'folder' ? `${item.name}/` : item.name
    }))
    .filter((item) => item.label.toLowerCase().includes(goToQuery.trim().toLowerCase()));

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
        .gh-tabs { display: flex; gap: 8px; padding: 16px 32px; border-bottom: 1px solid #30363d; background: #000000; }
        .gh-tab { padding: 8px 16px; font-size: 14px; color: #A1A1AA; border-bottom: 2px solid transparent; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .gh-tab.active { border-bottom-color: #A78BFA; font-weight: 600; color: #FFFFFF; }
        .gh-tab:hover { color: #FFFFFF; background: var(--agent-gradient); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        /* Layout */
        .gh-container { display: grid; grid-template-columns: minmax(0, 1fr) 300px; max-width: 1280px; margin: 0 auto; padding: 24px 32px; gap: 24px; align-items: flex-start; }
        .gh-main { min-width: 0; grid-column: 1; grid-row: 1 / span 2; }
        .gh-sidebar-top { width: 100%; position: static; grid-column: 2; grid-row: 1; }
        .gh-sidebar-bottom { width: 100%; position: static; grid-column: 2; grid-row: 2; }
        @media (max-width: 1023px) {
          .gh-container { display: flex; flex-direction: column; gap: 16px; padding: 16px 16px 128px; }
          .gh-main,
          .gh-sidebar-top,
          .gh-sidebar-bottom { grid-column: auto; grid-row: auto; }
          .gh-sidebar-top { order: 1; }
          .gh-main { order: 2; }
          .gh-sidebar-bottom { order: 3; }
        }
        @media (max-width: 900px) { .gh-sidebar-top, .gh-sidebar-bottom { position: static; } }
        @media (max-width: 767px) {
          .graph-svg-container { display: block; }
        }
        @media (max-width: 640px) {
          .gh-tabs { padding: 10px 12px; gap: 6px; }
          .gh-tab { padding: 6px 10px; font-size: 12px; }
          .gh-container { padding: 12px 12px 128px; gap: 16px; }
          .gh-controls { flex-wrap: wrap; gap: 10px; }
          .gh-branch-btn { font-size: 12px; height: 30px; }
          .gh-dropdown { width: 90vw; max-width: 320px; }
          .gh-go-to-panel { width: 90vw; max-width: 320px; }
          .gh-code-dropdown { width: 92vw; max-width: 360px; right: 0; }
          .gh-code-panel { padding: 16px; }
          .gh-code-panel-title { font-size: 14px; }
          .gh-code-methods { font-size: 12px; }
          .gh-file-box { margin-bottom: 18px; }
          .gh-commit-header { padding: 8px 12px; font-size: 12px; flex-wrap: wrap; gap: 6px; }
          .gh-file-row { padding: 6px 12px; font-size: 12px; flex-wrap: wrap; gap: 6px; }
          .gh-file-msg { display: none; }
          .gh-file-time { font-size: 10px; margin-left: 0; }
          .gh-readme-head { padding: 6px 10px; font-size: 11px; }
          .gh-readme-body { padding: 12px; }
          .exp-row { padding: 0 4px; text-align: left; }
          .exp-row.active { padding-left: 6px; }
          .exp-title { font-size: 12px; flex-direction: column; align-items: flex-start; gap: 4px; text-align: left; }
          .exp-meta { font-size: 8px; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; }
          .tag-badge { font-size: 8px; padding: 2px 6px; }
          .exp-details { padding: 6px 10px 8px; text-align: left; }
          .commit-details { font-size: 9px; text-align: left; }
          .markdown-bullet { margin-bottom: 4px; line-height: 1.35; text-align: left; }
        }

        /* Controls */
        .gh-controls { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .gh-branch-btn { background: transparent; border: 1px solid #30363d; color: #A1A1AA; border-radius: 6px; padding: 5px 12px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; height: 32px; transition: all 0.2s; }
        .gh-branch-btn:hover { background: rgba(129, 140, 248, 0.1); border-color: #818CF8; color: #FFFFFF; }
        .gh-dropdown { position: absolute; top: 100%; left: 0; width: 280px; background: #050505; border: 1px solid #30363d; border-radius: 6px; z-index: 50; margin-top: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.8); }
        .gh-go-to-panel { position: absolute; top: 100%; left: 0; width: 320px; background: #050505; border: 1px solid #30363d; border-radius: 10px; z-index: 55; margin-top: 6px; box-shadow: 0 12px 28px rgba(0,0,0,0.75); overflow: hidden; }
        .gh-go-to-header { padding: 10px 12px; border-bottom: 1px solid #30363d; font-size: 12px; font-weight: 600; color: #ffffff; }
        .gh-go-to-input { padding: 10px 12px; border-bottom: 1px solid #30363d; }
        .gh-go-to-input input { width: 100%; background: #0b0f14; border: 1px solid #30363d; border-radius: 8px; padding: 8px 10px; color: #e5e7eb; font-size: 12px; font-family: ui-monospace, SFMono-Regular, monospace; }
        .gh-go-to-input input:focus { outline: none; border-color: #818cf8; }
        .gh-go-to-list { max-height: 280px; overflow: auto; }
        .gh-go-to-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; font-size: 13px; color: #e5e7eb; }
        .gh-go-to-item:hover { background: rgba(129, 140, 248, 0.08); }
        .gh-go-to-meta { margin-left: auto; color: #6b7280; font-size: 11px; }
        .gh-go-to-empty { padding: 10px 12px; color: #6b7280; font-size: 12px; }
        .gh-code-dropdown { position: absolute; top: 100%; right: 0; width: 420px; background: #0b0f14; border: 1px solid #30363d; border-radius: 16px; z-index: 60; margin-top: 10px; box-shadow: 0 18px 40px rgba(0,0,0,0.7); overflow: hidden; }
        .gh-code-tabs { display: none; }
        .gh-code-panel { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .gh-code-panel-head { display: flex; align-items: center; justify-content: space-between; color: #ffffff; }
        .gh-code-panel-title { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 16px; }
        .gh-code-help { width: 22px; height: 22px; border-radius: 50%; border: 1px solid #30363d; display: grid; place-items: center; color: #a1a1aa; text-decoration: none; font-size: 12px; }
        .gh-code-methods { display: flex; gap: 18px; font-size: 13px; font-weight: 600; color: #a1a1aa; }
        .gh-code-method { background: transparent; border: none; color: inherit; cursor: pointer; padding-bottom: 6px; border-bottom: 2px solid transparent; }
        .gh-code-method.active { color: #ffffff; border-bottom-color: #f87171; }
        .gh-code-input { display: flex; align-items: center; gap: 10px; background: #0b0f14; border: 1px solid #30363d; border-radius: 8px; padding: 10px 12px; color: #e5e7eb; }
        .gh-code-input input { flex: 1; background: transparent; border: none; color: inherit; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; }
        .gh-code-input input:focus { outline: none; }
        .gh-code-copy { background: #111827; border: 1px solid #30363d; border-radius: 6px; color: #e5e7eb; font-size: 12px; padding: 6px 8px; cursor: pointer; }
        .gh-code-hint { color: #6b7280; font-size: 12px; margin: 0; }
        .gh-code-links { display: flex; flex-direction: column; gap: 10px; font-size: 13px; }
        .gh-code-links a { color: #e5e7eb; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .gh-code-links a:hover { color: #ffffff; }
        .gh-code-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #1f6feb; border-radius: 8px; padding: 10px 12px; color: #ffffff; text-decoration: none; font-weight: 600; }

        /* File Box */
        .gh-file-box { border: 1px solid #30363d; border-radius: 6px; background: transparent; margin-bottom: 24px; }
        .gh-commit-header { background: #050505; padding: 12px 16px; border-bottom: 1px solid #30363d; display: flex; align-items: center; gap: 12px; font-size: 13px; color: #A1A1AA; border-top-left-radius: 6px; border-top-right-radius: 6px; }
        .gh-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; border: 1px solid #30363d; }
        .gh-file-row { display: flex; align-items: center; padding: 8px 16px; border-top: 1px solid #30363d; font-size: 14px; color: #FFFFFF; cursor: pointer; }
        .gh-file-row:hover { background-color: rgba(129, 140, 248, 0.05); text-decoration: none; }
        .gh-file-row:hover .file-icon { fill: #A78BFA; transition: fill 0.2s; }
        .gh-file-row:first-of-type { border-top: none; }
        .file-icon { transition: fill 0.2s; }

        /* GRAPH CONTAINER */
        .gh-readme { border: 1px solid #30363d; border-radius: 6px; margin-top: 16px; background: transparent; overflow: hidden; display: flex; flex-direction: column; }
        .gh-readme-head { padding: 10px 16px; border-bottom: 1px solid #30363d; background: #050505; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; position: sticky; top: 0; z-index: 20; color: #FFFFFF; }

        .graph-wrapper { display: flex; position: relative; }
        .graph-svg-container { flex: 0 0 ${width}px; background: #000000; position: relative; }
        .graph-content-list { flex: 1; min-width: 0; background: #000000; position: relative; }

        /* Commit Rows */
        .exp-row {
            height: ${graphConfig.rowHeight}px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 20px;
            cursor: pointer;
            transition: background 0.15s;
            position: relative;
            border-bottom: 1px solid #30363d;
        }
        .exp-row::before {
            content: '';
            position: absolute;
            left: var(--connector-start, 0px);
            top: 50%;
            height: 1px;
            width: calc(0px - var(--connector-start, 0px));
            background: rgba(161, 161, 170, 0.18);
            transform: translateY(-50%);
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
        .exp-details { padding: 12px 24px 18px; animation: fadeIn 0.2s ease-out; }
        .commit-details { margin-top: 6px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; color: #d4d4d8; }
        .markdown-bullet { display: flex; gap: 10px; margin-bottom: 6px; line-height: 1.6; }
        .bullet-point { color: #22c55e; font-weight: 700; user-select: none; }
        .sidebar-contrib { transition: opacity 0.2s ease; }
        .sidebar-contrib.dimmed { opacity: 0.35; filter: grayscale(1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .gh-file-name { flex: 0 0 200px; overflow: hidden; }
        .gh-file-msg { flex: 0 0 350px; color: #A1A1AA; font-size: 13px; margin-left: 20%; }
        .gh-file-time { font-size: 12px; color: #A1A1AA; margin-left: auto; }

        @media (max-width: 640px) {
          .graph-wrapper { gap: 4px; }
          .exp-row { padding: 0 2px; align-items: flex-start; text-align: left; border-left: none; }
          .exp-row.active { padding-left: 4px; }
          .exp-title { font-size: 12px; flex-direction: row; align-items: center; justify-content: flex-start; text-align: left; }
          .exp-meta { font-size: 8px; flex-direction: row; align-items: center; justify-content: flex-start; text-align: left; }
          .tag-badge { font-size: 8px; padding: 2px 6px; }
          .exp-details { padding: 6px 8px 8px; text-align: left; }
          .commit-details { font-size: 9px; text-align: left; }
          .markdown-bullet { margin-bottom: 4px; line-height: 1.35; text-align: left; }
        }
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
        <div className="gh-sidebar-top">
           <div style={{borderBottom:'1px solid #30363d', paddingBottom: 24, marginBottom: 24}}>
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
              </div>
           </div>
        </div>

        <div className="gh-main">
          
          {/* TOP CONTROLS */}
          <div className="gh-controls" ref={dropdownRef}>
            <div style={{position:'relative'}}>
                <button className="gh-branch-btn" onClick={() => setBranchDropdownOpen(!isBranchDropdownOpen)}>
                    <Icons.Branch />
                    <span style={{color: '#FFFFFF'}}>
                        {activeBranch === "all" ? "main" : (BRANCH_CONFIG[activeBranch]?.name || activeBranch)}
                    </span>
                    <span style={{fontSize:'10px', marginLeft: 4}}>▼</span>
                </button>
                {isBranchDropdownOpen && (
                    <div className="gh-dropdown">
                        <div style={{padding:'8px 12px', fontWeight:'600', borderBottom:'1px solid #30363d', fontSize: '12px', color: '#FFFFFF'}}>Switch branches</div>
                        {/* Dynamic Branch List based on Current Data */}
                        {Object.keys(currentData.branches).map(key => (
                            <div key={key} style={{padding:'8px 16px', borderBottom:'1px solid #30363d', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', gap: 8}} onClick={() => selectBranch(key)}>
                                <div style={{width:8, height:8, borderRadius:'50%', background: BRANCH_CONFIG[key]?.color || '#818CF8'}}></div>
                                <span style={{color: '#FFFFFF'}}>{key === activeBranch ? <strong>{currentData.branches[key].name}</strong> : currentData.branches[key].name}</span>
                            </div>
                        ))}
                        <div style={{padding:'8px 16px', cursor:'pointer', fontSize:'12px', color: '#A1A1AA'}} onClick={() => selectBranch("all")}>Show All</div>
                    </div>
                )}
            </div>
            <div style={{display:'flex', gap:8, marginLeft:'auto'}}>
                <div style={{position:'relative'}}>
                    <button
                      className="gh-branch-btn"
                      style={{background: 'linear-gradient(to right, #818CF8, #A78BFA)', borderColor: 'transparent', color: '#FFFFFF'}}
                      onClick={() => setCodeDropdownOpen(!isCodeDropdownOpen)}
                    >
                        <Icons.Code /> Code <span style={{fontSize:'10px', marginLeft:4}}>▼</span>
                    </button>
                    {isCodeDropdownOpen && (
                      <div className="gh-code-dropdown">
                        <div className="gh-code-panel">
                            <div className="gh-code-panel-head">
                              <div className="gh-code-panel-title">
                                <Icons.Code />
                                <span>Clone</span>
                              </div>
                              <a
                                href="https://github.com/JonOuyang/JonOuyang.github.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gh-code-help"
                                aria-label="Open repository"
                              >
                                ?
                              </a>
                            </div>
                            <div className="gh-code-methods">
                              {[
                                { key: "https", label: "HTTPS" },
                                { key: "ssh", label: "SSH" },
                                { key: "cli", label: "GitHub CLI" },
                              ].map((item) => (
                                <button
                                  key={item.key}
                                  className={`gh-code-method ${activeCloneMethod === item.key ? "active" : ""}`}
                                  onClick={() => setActiveCloneMethod(item.key)}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                            <div className="gh-code-input">
                              <input
                                type="text"
                                readOnly
                                value={cloneUrls[activeCloneMethod]}
                                aria-label="Clone URL"
                              />
                              <button
                                type="button"
                                className="gh-code-copy"
                                onClick={() => copyToClipboard(cloneUrls[activeCloneMethod])}
                                aria-label="Copy clone URL"
                              >
                                ⧉
                              </button>
                            </div>
                            <p className="gh-code-hint">Clone using the web URL.</p>
                            <div className="gh-code-links">
                              <a
                                href="https://desktop.github.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open with GitHub Desktop
                              </a>
                              <a
                                href="https://github.com/JonOuyang/JonOuyang.github.io/archive/refs/heads/main.zip"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Download ZIP
                              </a>
                            </div>
                          </div>
                      </div>
                    )}
                </div>
            </div>
          </div>

          {/* FILE LIST (Mini) */}
          <div className="gh-file-box">
             <div className="gh-commit-header">
                <img className="gh-avatar" src="/assets/images/githubpfp.jpeg" alt="JonOuyang profile" />
                <span style={{fontWeight:600, color:'#FFFFFF'}}>JonOuyang</span>
                <span style={{marginLeft: 8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%', color:'#A1A1AA'}}>
                    refactor: optimize graph topology for merge commits
                </span>
                <span style={{marginLeft:'auto', fontFamily:'monospace', fontSize:12, color: '#818CF8'}}>{getHash('latest')}</span>
             </div>
             {files.map((f, i) => (
                <div key={i} className="gh-file-row" onClick={() => f.link && navigate(f.link)}>
                    <div style={{width:24}}>{f.type === 'folder' ? <Icons.Folder /> : <Icons.File />}</div>
                    <div className="gh-file-name"><span className="gh-link">{f.name}</span></div>
                    <div className="gh-file-msg">{f.msg}</div>
                    <div className="gh-file-time">{f.time}</div>
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
                                const d = getPath(edge.from.x, edge.from.y, edge.to.x, edge.to.y, graphConfig.curveRadius);
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
                                    <circle cx={node.x} cy={node.y} r={graphConfig.nodeRadius} fill="#000000" stroke={displayColor} strokeWidth="2.5" />

                                    {isMerge && <circle cx={node.x} cy={node.y} r={2} fill={displayColor} />}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* CONTENT LIST */}
                <div className="graph-content-list">
                    {nodes.map((node) => {
                        const isRelated = hoveredContext && matchesContext(node.company, hoveredContext);
                        const isDimmed = hoveredContext && !isRelated;
                        const baseOpacity = getOpacity(node.branches);
                        const rowOpacity = isDimmed ? baseOpacity * 0.35 : baseOpacity;

                        return (
                          <div key={node.id}>
                            <div 
                                className={`exp-row ${expandedNodeId === node.id ? 'active' : ''}`}
                                onClick={() => {
                                  const nextId = expandedNodeId === node.id ? null : node.id;
                                  setExpandedNodeId(nextId);
                                  setHoveredContext(nextId === null ? null : node.company);
                                }}
                                style={{
                                  opacity: rowOpacity,
                                  '--connector-start': `${node.x - width}px`,
                                }}
                            >
                                <div className="exp-title">
                                    {getDisplayTitle(node)}
                                    {/* Badges for every branch this commit touches */}
                                    {node.branches
                                      .filter((b) => b !== "main")
                                      .map((b) => (
                                        <span key={b} className="tag-badge"
                                              style={{
                                                color: BRANCH_CONFIG[b]?.color || '#fff',
                                                background: BRANCH_CONFIG[b]?.labelBg || 'transparent',
                                                border: `1px solid ${BRANCH_CONFIG[b]?.labelBorder || '#fff'}`
                                              }}>
                                            {BRANCH_CONFIG[b]?.name || b}
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
                                    <div className="commit-details">
                                        {node.bullets && node.bullets.length > 0 ? (
                                            node.bullets.map((bullet, i) => (
                                                <div key={i} className="markdown-bullet">
                                                    <span className="bullet-point">+</span>
                                                    <span>{bullet}</span>
                                                </div>
                                            ))
                                        ) : node.description ? (
                                            <div className="markdown-bullet">
                                                <span className="bullet-point">+</span>
                                                <span>{node.description}</span>
                                            </div>
                                        ) : (
                                            <div style={{fontStyle:'italic', color:'#A1A1AA'}}>No detailed description provided.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                          </div>
                        );
                    })}
                </div>
             </div>
          </div>
        </div>

        <div className="gh-sidebar-bottom">
           <div style={{borderBottom:'1px solid #30363d', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#FFFFFF', margin:'0 0 12px 0'}}>Releases</h3>
               <p style={{fontSize:12, color:'#A1A1AA', margin:0}}>No releases published</p>
           </div>

           <div style={{borderBottom:'1px solid #30363d', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#FFFFFF', margin:'0 0 12px 0'}}>Packages</h3>
               <p style={{fontSize:12, color:'#A1A1AA', margin:0}}>No packages published</p>
           </div>

           <div style={{borderBottom:'1px solid #30363d', paddingBottom: 24, marginBottom: 24}}>
               <h3 style={{fontSize:16, fontWeight:600, color:'#FFFFFF', margin:'0 0 12px 0', display:'flex', alignItems:'center'}}>
                   Contributors <span style={{backgroundColor:'transparent', color:'#A1A1AA', borderRadius:10, padding:'2px 8px', fontSize:12, fontWeight:500, border:'1px solid #30363d', marginLeft:8}}>{contributors.length}</span>
               </h3>
               <ul style={{listStyle:'none', padding:0, margin:0}}>
                  {contributors.map((c, i) => {
                      const isRelated = hoveredContext && matchesContext(c.relatedTo, hoveredContext);
                      const isDimmed = hoveredContext && !isRelated;
                      return (
                          <li
                            key={i}
                            className={`sidebar-contrib ${isDimmed ? 'dimmed' : ''}`}
                            style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}
                          >
                              <img src={c.avatarUrl} alt={c.username} style={{width:32, height:32, borderRadius:'50%', border:'1px solid #30363d', objectFit:'cover'}} />
                              <div>
                                  <a href={c.link} style={{color:'#FFFFFF', fontWeight:600, textDecoration:'none', fontSize:14}}>{c.username}</a>
                                  <div style={{fontSize:12, color:'#A1A1AA'}}>{c.description}</div>
                              </div>
                          </li>
                      );
                  })}
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
