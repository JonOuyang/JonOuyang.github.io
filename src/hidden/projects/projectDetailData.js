// src/hidden/projects/projectDetailData.js
// All project detail content - text, images, sections, links, etc.
// Separated from component code for easy editing

export const projectDetails = {
  // Project ID 0 - JAYU (Main hero project)
  0: {
    title: "JAYU: Gemini Computer Use Agent",
    subtitle: "A vision-language agent capable of controlling desktop environments to perform complex, multi-step tasks with human-level reliability.",
    date: "Nov 18, 2024",
    readTime: "12 min read",
    authors: [
      { name: "Jonathan Ouyang", role: "Lead Researcher", avatar: "/api/placeholder/40/40" },
      { name: "Yuchen Cui", role: "Advisor, UCLA", avatar: "/api/placeholder/40/40" },
    ],
    links: {
      github: "https://github.com/jonouyang/jayu",
      youtube: "https://youtube.com",
      devpost: "https://devpost.com",
      paper: "#",
      article: "https://ai.google.dev/competition/projects/jayu"
    },
    heroImage: "https://ai.google.dev/images/winners/jayu.jpg",
    heroCaption: "Figure 1: JAYU Agent identifying UI elements and executing a complex booking task.",

    // Table of Contents sections
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "architecture", title: "System Architecture" },
      { id: "vision", title: "Vision-Language Integration" },
      { id: "performance", title: "Performance Benchmarks" },
      { id: "future", title: "Future Work" }
    ],

    // Actual content for each section
    content: {
      intro: {
        paragraphs: [
          "Computer use is a fundamental capability for autonomous agents. While LLMs have demonstrated remarkable reasoning abilities, translating that reasoning into precise mouse movements, clicks, and keystrokes remains a significant challenge.",
          "JAYU introduces a novel architecture that combines vision-language models with a specialized action space, allowing it to navigate complex GUIs with 94% accuracy on standard benchmarks."
        ]
      },
      architecture: {
        paragraphs: [
          "The core of JAYU relies on a dual-stream processing unit. The visual stream analyzes the screen state at 30fps, while the reasoning stream plans long-horizon tasks."
        ],
        figures: [
          {
            type: "placeholder",
            caption: "Figure 2: The dual-stream processing unit flow.",
            placeholder: "Architecture Diagram Placeholder"
          }
        ]
      },
      vision: {
        paragraphs: [
          "By leveraging the Gemini 1.5 Pro API, we are able to process high-resolution screenshots natively. We specifically fine-tuned the model on a dataset of 10,000 GUI interactions to improve coordinate prediction accuracy."
        ]
      },
      performance: {
        paragraphs: [
          "We tested JAYU against state-of-the-art models in the MiniWob++ environment."
        ],
        tables: [
          {
            headers: ["Model", "Success Rate", "Steps per Task"],
            rows: [
              { cells: ["JAYU (Ours)", "94.2%", "12.4"], highlight: true },
              { cells: ["Previous SOTA", "88.5%", "15.1"], highlight: false },
              { cells: ["Baseline", "62.0%", "22.8"], highlight: false }
            ]
          }
        ]
      },
      future: {
        paragraphs: [
          "Future work will focus on expanding JAYU's capabilities to mobile environments and improving multi-modal reasoning."
        ]
      }
    }
  },

  // Project ID 1 - SABRE
  1: {
    title: "SABRE: Shared Autonomy for Battlefield Response",
    subtitle: "An autonomous drone coordination system for battlefield awareness and tactical response.",
    date: "Oct 2024",
    readTime: "8 min read",
    authors: [
      { name: "Jonathan Ouyang", role: "Lead Developer", avatar: "/api/placeholder/40/40" },
    ],
    links: {
      github: "#",
      youtube: "#",
    },
    heroImage: "https://www.flyeye.io/wp-content/uploads/2023/07/Drones-1.jpg",
    heroCaption: "Figure 1: SABRE drone swarm coordination system.",
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "system", title: "System Overview" },
    ],
    content: {
      intro: {
        paragraphs: [
          "SABRE (Shared Autonomy for Battlefield Response and Engagement) is an autonomous drone coordination system designed for tactical awareness.",
          "The system leverages ROS2 and computer vision to enable real-time coordination between multiple UAVs."
        ]
      },
      system: {
        paragraphs: [
          "Content coming soon..."
        ]
      }
    }
  },

  // Project ID 2 - LEVIATHAN
  2: {
    title: "LEVIATHAN: AI Co-Pilot for Smart Fishing",
    subtitle: "Bringing big insights no matter the crew size. Your AI co-pilot for commercial and recreational fishing.",
    date: "Sep 2024",
    readTime: "6 min read",
    authors: [
      { name: "Jonathan Ouyang", role: "Developer", avatar: "/api/placeholder/40/40" },
    ],
    links: {
      github: "#",
    },
    heroImage: "https://img.nauticexpo.com/images_ne/photo-g/28032-18598681.webp",
    heroCaption: "Figure 1: LEVIATHAN marine analytics dashboard.",
    sections: [
      { id: "intro", title: "Introduction" },
    ],
    content: {
      intro: {
        paragraphs: [
          "LEVIATHAN is an AI-powered fishing assistant that helps crews of any size make data-driven decisions on the water.",
          "Content coming soon..."
        ]
      }
    }
  },

  // Add more projects as needed...
  // Template:
  /*
  [projectId]: {
    title: "",
    subtitle: "",
    date: "",
    readTime: "",
    authors: [{ name: "", role: "", avatar: "" }],
    links: { github: "", youtube: "", devpost: "", paper: "" },
    heroImage: "",
    heroCaption: "",
    sections: [{ id: "", title: "" }],
    content: {
      [sectionId]: {
        paragraphs: [],
        figures: [{ type: "image|video|placeholder", src: "", caption: "", placeholder: "" }],
        tables: [{ headers: [], rows: [{ cells: [], highlight: false }] }]
      }
    }
  }
  */
};

// Helper to get project detail by ID
export const getProjectDetail = (id) => {
  return projectDetails[id] || null;
};

// Get all project IDs that have detail pages
export const getProjectIdsWithDetails = () => {
  return Object.keys(projectDetails).map(id => parseInt(id));
};
