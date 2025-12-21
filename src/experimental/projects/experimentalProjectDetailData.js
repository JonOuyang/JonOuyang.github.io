// src/experimental/projects/experimentalProjectDetailData.js
// All project detail content - text, images, sections, links, etc.
// Separated from component code for easy editing

import sabreImg from "../../assets/images/sabre.jpg";
import leviathanImg from "../../assets/images/leviathan.jpg";

export const experimentalProjectDetails = {
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
    heroImage: sabreImg,
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
    heroImage: leviathanImg,
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

  // Project ID 3 - Bruin Bite
  3: {
    title: "Bruin Bite: UCLA Dining Companion",
    subtitle: "Find and review the best dining halls and food spots on UCLA campus with a clean, student-first UI.",
    date: "Aug 2024",
    readTime: "5 min read",
    authors: [{ name: "Jonathan Ouyang", role: "Builder", avatar: "/api/placeholder/40/40" }],
    links: {
      website: "#",
    },
    heroImage: "https://wp.dailybruin.com/images/2024/09/web.regissue.quad_.diningplancritiques.file_.jpg",
    heroCaption: "Figure: Student-first views of UCLA dining halls and menus.",
    sections: [
      { id: "overview", title: "Overview" },
      { id: "features", title: "Features" },
      { id: "stack", title: "Stack" },
    ],
    content: {
      overview: {
        paragraphs: [
          "Bruin Bite is a lightweight discovery tool for UCLA dining. It prioritizes quick load times and readable menu data over heavy visuals.",
        ],
      },
      features: {
        paragraphs: [
          "Menu browsing, ratings, and saved favorites with minimal taps.",
        ],
      },
      stack: {
        paragraphs: [
          "React front-end with simple REST fetching; deploy-ready static assets.",
        ],
      },
    },
  },

  // Project ID 4 - Sir Syncs A Lot
  4: {
    title: "Sir Syncs A Lot: Phone-to-Desktop Control",
    subtitle: "Control your computer from your phone as an extension of a computer-use agent.",
    date: "Jul 2024",
    readTime: "4 min read",
    authors: [{ name: "Jonathan Ouyang", role: "Builder", avatar: "/api/placeholder/40/40" }],
    links: {
      github: "#",
    },
    heroImage: "https://plus.unsplash.com/premium_photo-1681288023821-7ae9a9d79474?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    heroCaption: "Figure: Remote control surface driving desktop input.",
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "control", title: "Control Surface" },
      { id: "future", title: "Future Work" },
    ],
    content: {
      intro: {
        paragraphs: [
          "Sir Syncs A Lot bridges phone gestures to desktop actions for quick remote control.",
        ],
      },
      control: {
        paragraphs: [
          "WebSocket layer routes gestures to a local agent that synthesizes mouse/keyboard events.",
        ],
      },
      future: {
        paragraphs: [
          "Next steps include secure pairing and haptic feedback for confirmations.",
        ],
      },
    },
  },

  // Project ID 5 - Berry Tongue
  5: {
    title: "Berry Tongue: AI Language Companion",
    subtitle: "AI-powered language learning Chrome extension that surfaces vocabulary in context.",
    date: "Jun 2024",
    readTime: "4 min read",
    authors: [{ name: "Jonathan Ouyang", role: "Builder", avatar: "/api/placeholder/40/40" }],
    links: {
      github: "#",
    },
    heroImage: "https://holdenfg.org/wp-content/uploads/2021/03/alex-ushakoff-6MynOBZgig0-unsplash-1920x1280.jpg.webp",
    heroCaption: "Figure: In-page overlays highlighting vocabulary.",
    sections: [
      { id: "overview", title: "Overview" },
      { id: "nlp", title: "NLP Flow" },
      { id: "results", title: "Results" },
    ],
    content: {
      overview: {
        paragraphs: [
          "Berry Tongue injects contextual hints directly into webpages while you browse.",
        ],
      },
      nlp: {
        paragraphs: [
          "A lightweight Gemini prompt extracts key phrases; Manim renders quick explainer snippets.",
        ],
      },
      results: {
        paragraphs: [
          "Early testers reported faster retention with inline highlights versus separate flashcards.",
        ],
      },
    },
  },

  // Project ID 6 - UCLA Course Planner
  6: {
    title: "UCLA Course Planner",
    subtitle: "Plan UCLA courses with prerequisite validation and schedule visualization.",
    date: "May 2024",
    readTime: "5 min read",
    authors: [{ name: "Jonathan Ouyang", role: "Builder", avatar: "/api/placeholder/40/40" }],
    links: {
      website: "#",
    },
    heroImage: "https://www.mccormick.northwestern.edu/images/news/2022/02/undergraduate-launches-course-planning-web-application-header.jpg",
    heroCaption: "Figure: Term-by-term planner with conflicts surfaced inline.",
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "planner", title: "Planner UX" },
      { id: "tech", title: "Tech" },
    ],
    content: {
      intro: {
        paragraphs: [
          "Built for UCLA students to visualize schedules and prerequisite chains quickly.",
        ],
      },
      planner: {
        paragraphs: [
          "Drag-and-drop terms, instant conflict warnings, and PDF export for advising.",
        ],
      },
      tech: {
        paragraphs: [
          "Go backend with JWT auth and Redis caching; React client for smooth interactions.",
        ],
      },
    },
  },

  // Project ID 7 - Project Oliver
  7: {
    title: "Project Oliver: Newsgrounded QA",
    subtitle: "RAG chatbot answering questions by citing UCLA Daily Bruin articles.",
    date: "Apr 2024",
    readTime: "4 min read",
    authors: [{ name: "Jonathan Ouyang", role: "Builder", avatar: "/api/placeholder/40/40" }],
    links: {
      github: "#",
    },
    heroImage: "https://hips.hearstapps.com/hmg-prod/images/small-fluffy-dog-breeds-maltipoo-663009b6293cc.jpg?crop=0.668xw:1.00xh;0.143xw,0",
    heroCaption: "Figure: Retrieval-augmented responses with inline citations.",
    sections: [
      { id: "overview", title: "Overview" },
      { id: "retrieval", title: "Retrieval" },
      { id: "ui", title: "UI" },
    ],
    content: {
      overview: {
        paragraphs: [
          "Oliver ingests Daily Bruin archives and answers campus questions with sources.",
        ],
      },
      retrieval: {
        paragraphs: [
          "Pinecone index + Gemini reranker to keep citations faithful.",
        ],
      },
      ui: {
        paragraphs: [
          "Chat interface highlights cited passages and links back to the newspaper.",
        ],
      },
    },
  },

  // Project ID 8 - Persistence
  8: {
    title: "Persistence: AI Task Manager",
    subtitle: "An AI-powered to-do list, task manager, and reminder app across web/mobile.",
    date: "Mar 2024",
    readTime: "4 min read",
    authors: [{ name: "Jonathan Ouyang", role: "Builder", avatar: "/api/placeholder/40/40" }],
    links: {
      website: "#",
    },
    heroImage: "https://images.squarespace-cdn.com/content/v1/5e6a7ab5992a417f3a08b6a4/c1e0bf5b-3c3b-43cf-8a55-4703e95495a3/iStock-1473980728.jpg",
    heroCaption: "Figure: Cross-platform planner with AI-suggested scheduling.",
    sections: [
      { id: "intro", title: "Introduction" },
      { id: "ai", title: "AI Scheduling" },
      { id: "platforms", title: "Platforms" },
    ],
    content: {
      intro: {
        paragraphs: [
          "Persistence keeps tasks organized with a lightweight, distraction-free UI.",
        ],
      },
      ai: {
        paragraphs: [
          "AI suggests time slots and sequences based on deadlines and habits.",
        ],
      },
      platforms: {
        paragraphs: [
          "Shared Go + gRPC backend with Redis queues; clients for web and mobile.",
        ],
      },
    },
  },

  // Project ID 9 - Project Montgomery
  9: {
    title: "Project Montgomery: Math & Physics Animator",
    subtitle: "Animation generator for students and educators built on Manim.",
    date: "Feb 2024",
    readTime: "4 min read",
    authors: [{ name: "Jonathan Ouyang", role: "Builder", avatar: "/api/placeholder/40/40" }],
    links: {
      github: "https://github.com/JonOuyang/CalHacks-Project",
    },
    heroImage: "https://github.com/JonOuyang/CalHacks-Project/raw/main/display_images/image.png",
    heroCaption: "Figure: Rendered math visualizations generated from prompts.",
    sections: [
      { id: "overview", title: "Overview" },
      { id: "generation", title: "Generation" },
      { id: "outputs", title: "Outputs" },
    ],
    content: {
      overview: {
        paragraphs: [
          "Project Montgomery turns natural language prompts into math/physics animations.",
        ],
      },
      generation: {
        paragraphs: [
          "Gemini-assisted scene scripting feeds Manim; renders are queued and delivered back.",
        ],
      },
      outputs: {
        paragraphs: [
          "Exports MP4/GIF with captions; includes templates for classrooms and talks.",
        ],
      },
    },
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
export const getExperimentalProjectDetail = (id) => {
  return experimentalProjectDetails[id] || null;
};

// Get all project IDs that have detail pages
export const getExperimentalProjectIdsWithDetails = () => {
  return Object.keys(experimentalProjectDetails).map(id => parseInt(id));
};
