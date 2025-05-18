const labelsClasses = [
  "indigo",
  "gray",
  "green",
  "blue",
  "red",
  "purple",
  "yellow",
  "pink",
  "teal"
 
];

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  safelist: [
    ...labelsClasses.map((lbl) => `bg-${lbl}-50`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-100`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-200`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-300`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-400`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-500`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-600`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-700`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-800`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-900`),
    ...labelsClasses.map((lbl) => `border-${lbl}-100`),
    ...labelsClasses.map((lbl) => `border-${lbl}-200`),
    ...labelsClasses.map((lbl) => `border-${lbl}-300`),
    ...labelsClasses.map((lbl) => `border-${lbl}-400`),
    ...labelsClasses.map((lbl) => `border-${lbl}-500`),
    ...labelsClasses.map((lbl) => `border-${lbl}-600`),
    ...labelsClasses.map((lbl) => `text-${lbl}-50`),
    ...labelsClasses.map((lbl) => `text-${lbl}-100`),
    ...labelsClasses.map((lbl) => `text-${lbl}-200`),
    ...labelsClasses.map((lbl) => `text-${lbl}-300`),
    ...labelsClasses.map((lbl) => `text-${lbl}-400`),
    ...labelsClasses.map((lbl) => `text-${lbl}-500`),
    ...labelsClasses.map((lbl) => `text-${lbl}-600`),
    ...labelsClasses.map((lbl) => `text-${lbl}-700`),
    ...labelsClasses.map((lbl) => `text-${lbl}-800`),
    ...labelsClasses.map((lbl) => `text-${lbl}-900`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-50`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-100`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-200`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-300`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-400`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-500`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-600`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-700`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-800`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-900`),
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          DEFAULT: '#8DB600', // Apple green color
          500: '#8DB600',    // Optional: Define shades if needed
        },
      },
    },
  },
  plugins: [],
  darkMode: true,
  theme: {
    extend: {
      fontFamily: {
        sans: ["Open Sans"]
      },
      gridTemplateColumns: {
        "1/5": "1fr 5fr"
      },
      height: {
        "1/2": "50%"
      },
      zIndex: {
        '100': '100',
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['hover', 'active'],
      borderColor: ['focus', 'hover'],
      opacity: ['disabled'],
    },
  },
  plugins: [require("@tailwindcss/forms")],
}