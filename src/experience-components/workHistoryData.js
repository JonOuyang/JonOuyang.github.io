// Centralized data structure for all work-history subpages

import { contributorsData } from "./contributors.js";
import { experienceData } from "./experiences.js";
import { extracurricularData } from "./extracurriculars.js";
const coverLetterPdf = "/resumes/Ouyang_Jonathan_Cover_Letter.pdf";
const resumePdf = "/resumes/Jonathan Ouyang Resume.pdf";
const resumeAltPdf = "/resumes/Jonathan_Ouyang_resume.pdf";

const contributorsRaw = `export const contributorsData = ${JSON.stringify(contributorsData, null, 2)};`;
const experiencesRaw = `export const experienceData = ${JSON.stringify(experienceData, null, 2)};`;
const extracurricularsRaw = `export const extracurricularData = ${JSON.stringify(extracurricularData, null, 2)};`;

const mainReadme = `# Work History

This repository contains my professional timeline visualized as a git graph.

## Structure

- **Javascript/** - Raw JavaScript data files powering the visualization
- **Resume & Cover Letter PDFs** - Professional documents

## About

Toggle branches to explore different career tracks including software engineering, research, and leadership roles.
`;

const javascriptReadme = `# Javascript

This folder contains the raw JavaScript data files that power the Work History visualization.

## Files

- **contributors.js** - Research advisors and collaborators
- **experiences.js** - Work experience data with branch information
- **extracurriculars.js** - Extracurricular activities and leadership roles
`;

// File type definitions: "code" | "pdf" | "image" | "markdown"
export const workHistoryData = {
  // Root level files (shown in work-history main page)
  rootFiles: [
    {
      name: "README.md",
      type: "markdown",
      content: mainReadme,
      msg: "Update README.md",
      date: "6 months ago"
    },
    {
      name: "Ouyang_Jonathan_Cover_Letter.pdf",
      type: "pdf",
      file: coverLetterPdf,
      msg: "Cover letter template",
      date: "2 days ago"
    },
    {
      name: "Jonathan Ouyang Resume.pdf",
      type: "pdf",
      file: resumePdf,
      msg: "Full resume",
      date: "1 week ago"
    },
    {
      name: "Jonathan_Ouyang_resume.pdf",
      type: "pdf",
      file: resumeAltPdf,
      msg: "Compressed version",
      date: "3 months ago"
    }
  ],

  // Folders configuration
  folders: {
    javascript: {
      name: "Javascript",
      path: "javascript",
      msg: "added readme descriptions for files",
      date: "6 months ago",
      readme: javascriptReadme,
      files: [
        {
          name: "contributors.js",
          type: "code",
          language: "javascript",
          content: contributorsRaw,
          msg: "Update contributor list",
          date: "2 months ago"
        },
        {
          name: "experiences.js",
          type: "code",
          language: "javascript",
          content: experiencesRaw,
          msg: "Refactor work experience data structure",
          date: "3 weeks ago"
        },
        {
          name: "extracurriculars.js",
          type: "code",
          language: "javascript",
          content: extracurricularsRaw,
          msg: "Add new hackathon projects",
          date: "4 days ago"
        }
      ]
    }
  }
};

// Helper function to get folder by path
export const getFolderByPath = (path) => {
  return workHistoryData.folders[path] || null;
};

// Helper function to get file from folder
export const getFileFromFolder = (folderPath, fileName) => {
  const folder = getFolderByPath(folderPath);
  if (!folder) return null;
  return folder.files.find(f => f.name === fileName) || null;
};

// Helper to get all folders as array for file tree
export const getAllFolders = () => {
  return Object.values(workHistoryData.folders);
};

// Helper to get all root files
export const getRootFiles = () => {
  return workHistoryData.rootFiles;
};

// Helper to get a root file by name
export const getRootFileByName = (fileName) => {
  return workHistoryData.rootFiles.find(f => f.name === fileName) || null;
};
