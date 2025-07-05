import {
    blackImg,
    blueImg,
    highlightFirstVideo,
    highlightSecondVideo,
    highlightThirdVideo,
    highlightFourthVideo,
    highlightFifthVideo,
    whiteImg,
    yellowImg,
  } from "../utils";
  
  export const navLists = [
    { name: "Home", path: "/" },
    { name: "Work History", path: "/work-history" },
    { name: "Research", path: "/research" },
    { name: "Contact", path: "/contact" },
    { name: "Beta Testing", path: "/beta" },
  ];
  
  export const hightlightsSlides = [
    {
      id: 1, // Google Gemini API Developer Competition
      textLists: [
        "Google Gemini API Developer Competition",
        "Grand Prize Winner",
        "1981 DeLorean + 60K USD Cash"
      ],
      video: highlightFirstVideo,
      videoDuration: 4,
    },
    {
      id: 2, // Google Promotional Shoot
      textLists: [
        "Google Video Shoot", 
        "March 5, 2025 at UCLA"
      ],
      video: highlightSecondVideo,
      videoDuration: 5,
    },
    {
      id: 3, // starting at Amazon
      textLists: [
        "Incoming at Amazon",
        "2025 Summer at Culver City"
      ],
      video: highlightThirdVideo,
      videoDuration: 1.2,
    },
    {
      id: 4,
      textLists: [
        "Founder & President of GLITCH", 
        "UCLA's Premier Hackathon Club"
      ],
      video: highlightFourthVideo,
      videoDuration: 2,
    },
    {
      id: 5,
      textLists: [
        "Joined Stanford ILIAD Lab",
        "Researching Shared Autonomy in Driving",
        "In Collaboration with Toyota Research Institute (TRI)",
      ],
      video: highlightFifthVideo,
      videoDuration: 8,
    },
  ];
  
  export const models = [
    {
      id: 1,
      title: "iPhone 15 Pro in Natural Titanium",
      color: ["#8F8A81", "#ffe7b9", "#6f6c64"],
      img: yellowImg,
    },
    {
      id: 2,
      title: "iPhone 15 Pro in Blue Titanium",
      color: ["#53596E", "#6395ff", "#21242e"],
      img: blueImg,
    },
    {
      id: 3,
      title: "iPhone 15 Pro in White Titanium",
      color: ["#C9C8C2", "#ffffff", "#C9C8C2"],
      img: whiteImg,
    },
    {
      id: 4,
      title: "iPhone 15 Pro in Black Titanium",
      color: ["#454749", "#3b3b3b", "#181819"],
      img: blackImg,
    },
  ];
  
  export const sizes = [
    { label: '6.1"', value: "small" },
    { label: '6.7"', value: "large" },
  ];
  
  export const footerLinks = [
    "Privacy Policy",
    "Terms of Use",
    "Sales Policy",
    "Legal",
    "Site Map",
  ];