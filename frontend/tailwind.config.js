/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: '#EFFF00', // neon yellow
          'primary-focus': '#D6E600', // slightly darker shade for hover
          'primary-content': '#000000', // black text on primary
          secondary: '#00E474', // bright green
          'secondary-content': '#000000', // black text on secondary
          accent: '#737373', // subtle accent
          neutral: '#1A1A1A', // dark gray
          'base-100': '#000000', // black
          'base-200': '#0E0E0E', // slightly lighter black
          'base-300': '#1A1A1A', // even lighter black
          'base-content': '#FFFFFF', // white text
        },
      },
    },
    plugins: [require("daisyui")],
    daisyui: {
      themes: ["cyberpunk", "dark", "light"]
      // darkTheme: "dark",
    },
  }