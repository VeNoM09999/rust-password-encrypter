export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // make sure paths are correct
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "cursive"], // fallback optional
        bangers: ["Bangers", "cursive"], // fallback optional
      },
    },
  },
};
