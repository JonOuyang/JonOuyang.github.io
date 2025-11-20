/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}"
    ],
    // Extract only class patterns we actually use
    extract: {
      jsx: (content) => {
        // More efficient regex extraction
        return content.match(/className="[^"]*"/g) || []
      }
    }
  },
  theme: {
    extend: {
      colors: {
        blue: "#2997FF",
        gray: {
          DEFAULT: "#86868b",
          100: "#94928d",
          200: "#afafaf",
          300: "#42424570",
        },
        zinc: "#101010",
      },
    },
  },
  // Only generate utilities we actually use
  corePlugins: {
    // Disable unused features for faster builds
    preflight: true,
  },
  plugins: [],
};
