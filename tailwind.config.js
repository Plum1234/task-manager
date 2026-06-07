/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 18px 50px rgba(24, 24, 27, 0.08)",
      },
    },
  },
  plugins: [],
};
