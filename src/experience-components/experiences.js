import googleImg from "../assets/images/google.png";
import iliadImg from "../assets/images/iliad.png";
import urilImg from "../assets/images/uril.jpg";
import amazonImg from "../assets/images/amazon.png";
import dailyBruinImg from "../assets/images/dailybruin.jpg";
import sighthoundImg from "../assets/images/sighthound.png";
import sjsuImg from "../assets/images/sjsu.jpg";

export const experienceData = {
  experiences: [
    {
      id: "exp1",
      date: "2024 - Present",
      title: "Incoming Software Engineer Intern",
      company: "Google",
      description: "Working with Prof. Dorsa Sadigh & Toyota Research Institute on shared autonomy algorithms. Developed NMPC expert agent achieving 96% success rate in parallel parking tasks.",
      branches: ["main", "swe"],
      image: googleImg
    },
    {
      id: "exp1",
      date: "2024 - Present",
      title: "Visiting Researcher",
      company: "Stanford ILIAD Lab",
      description: "Working with Prof. Dorsa Sadigh & Toyota Research Institute on shared autonomy algorithms. Developed NMPC expert agent achieving 96% success rate in parallel parking tasks.",
      branches: ["main", "ai-ml"],
      image: iliadImg
    },
    {
      id: "exp3",
      date: "2023 - Present",
      title: "Undergraduate Researcher",
      company: "UCLA Robot Intelligence Lab",
      description: "Co-first-author on GAMMA (RSS 2025). Adapted Action Chunking Transformer to ALOHA robot achieving 90% success rate. Built gaze-assisted robotic control improving speed by 250%.",
      branches: ["ai-ml", "main"],
      image: urilImg
    },
    {
      id: "exp4",
      date: "Summer 2024",
      title: "Software Engineer Intern",
      company: "Amazon Prime Video Studios",
      description: "Built Java catalog compiler processing 7M+ titles/day. Automated metadata ingestion eliminating 90% of errors. Integrated with Apple, Google, Samsung for cross-platform deployment.",
      branches: ["swe", "main"],
      image: amazonImg
    },
    {
      id: "exp5",
      date: "2023 - 2024",
      title: "Software Engineer",
      branchTitles: {
        "ai-ml": "AI Engineer",
        "swe": "Software Engineer",
        "main": "Software Engineer"
      },
      company: "UCLA Daily Bruin",
      description: "Optimized React website reducing bundle size 40% and supporting 60k+ concurrent users. Built 'Olivier' RAG chatbot using Pinecone + Redis + OpenAI. Designed Redis caching absorbing 80% of read traffic.",
      branches: ["swe", "ai-ml"],
      image: dailyBruinImg
    },
    {
      id: "exp6",
      date: "Summer 2023",
      title: "Computer Vision Intern",
      company: "Sighthound, Inc.",
      description: "Built VLM annotation tool using PaliGemma + OWL-ViT improving labeling throughput by 50%. Created image augmentation pipeline increasing dataset size 6× and boosting model accuracy by 5%.",
      branches: ["ai-ml", "swe"],
      image: sighthoundImg
    },
    {
      id: "exp7",
      date: "2022 - 2023",
      title: "Graduate Research Advisor",
      company: "SJSU AI/DL FPGA/DSP Lab",
      description: "Led swimmer action recognition research using YOLOv7 + OpenPose + CNN. Published at IEEE SSIAI 2024. Co-authored GPU vs FPGA benchmark thesis. Advised M.S. student on GAN-based action recognition.",
      branches: ["ai-ml", "main"],
      image: sjsuImg
    },
    {
      id: "exp8",
      date: "2022 - 2023",
      title: "Visiting Researcher",
      company: "SJSU AI/DL FPGA/DSP Lab",
      description: "Led swimmer action recognition research using YOLOv7 + OpenPose + CNN. Published at IEEE SSIAI 2024. Co-authored GPU vs FPGA benchmark thesis. Advised M.S. student on GAN-based action recognition.",
      branches: ["ai-ml", "main"],
      image: sjsuImg
    },
    {
      id: "exp9",
      date: "2022 - 2023",
      title: "Laboratory Intern",
      company: "SJSU AI/DL FPGA/DSP Lab",
      description: "Led swimmer action recognition research using YOLOv7 + OpenPose + CNN. Published at IEEE SSIAI 2024. Co-authored GPU vs FPGA benchmark thesis. Advised M.S. student on GAN-based action recognition.",
      branches: ["ai-ml", "main"],
      image: sjsuImg
    }
  ],
  branches: {
    main: { name: "Main", color: "#ff7b00" },
    swe: { name: "Software Engineering", color: "#00aaff" },
    "ai-ml": { name: "AI / ML", color: "#e83e8c" }
  }
};
