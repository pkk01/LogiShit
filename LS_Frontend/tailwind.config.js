/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#22C55E",
        bg: "#F9FAFB",
        surface: "#FFFFFF",
        textPrimary: "#1E293B",
        textSecondary: "#64748B",
        alert: "#F97316",
        success: "#16A34A",
        error: "#DC2626",
      },
    },
  },
  plugins: [],
};
