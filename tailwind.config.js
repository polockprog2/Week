const labelsClasses = [
  "indigo",
  "gray",
  "green",
  "blue",
  "red",
  "purple",
  "yellow",
  "pink",
 
];

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  safelist: [
    ...labelsClasses.map((lbl) => `bg-${lbl}-200`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-600`),
    ...labelsClasses.map((lbl) => `bg-${lbl}-900`),
    ...labelsClasses.map((lbl) => `border-${lbl}-300`),
    ...labelsClasses.map((lbl) => `border-${lbl}-400`),
    ...labelsClasses.map((lbl) => `text-${lbl}-600`),
    ...labelsClasses.map((lbl) => `text-${lbl}-900`),
    ...labelsClasses.map((lbl) => `hover:bg-${lbl}-600`),
  ],
  darkMode: false,
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