// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Light-mode only — no dark: class toggling
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        // ── Memoir linen palette ──────────────────────
        background: "#f4f2f0",   // linen-warm — page bg, sidebar
        surface: "#edeae7",   // linen-mid — sidebar nav, dividers
        surfaceRaised: "#ffffff",   // pure-white — cards, inputs
        border: "rgba(0,0,0,0.10)",

        // ── Ink text scale ────────────────────────────
        primary: "#000000",   // ink-black — headings, labels
        secondary: "rgba(0,0,0,0.45)", // ink-muted — body, meta

        // ── Warm amber accent ─────────────────────────
        accent: "#C8854A",
        accentHover: "#B0713A",
        accentMuted: "#F5E6D6",   // pale amber tint for chip bg

        // ── Semantic signals ──────────────────────────
        success: "#4A7C59",
        warning: "#C8854A",   // same warm amber
        error: "#B54A3A",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        serif: ["Source Serif 4", "Georgia", "serif"],
      },
      fontSize: {
        // Memoir type scale
        hero: ["64px", { lineHeight: "70.4px", fontWeight: "500", letterSpacing: "-4.48px" }],
        section: ["48px", { lineHeight: "52.8px", fontWeight: "500", letterSpacing: "-2.88px" }],
        card: ["28px", { lineHeight: "28px", fontWeight: "500", letterSpacing: "-1.96px" }],
        "label-lg": ["16px", { lineHeight: "22.4px", fontWeight: "600", letterSpacing: "-0.64px" }],
        "label-md": ["14px", { lineHeight: "14px", fontWeight: "600", letterSpacing: "-0.56px" }],
        "label-sm": ["12px", { lineHeight: "12px", fontWeight: "600", letterSpacing: "-0.48px" }],
        "body-sm": ["12px", { lineHeight: "18px", fontWeight: "500", letterSpacing: "-0.48px" }],
        micro: ["10px", { lineHeight: "10px", fontWeight: "500", letterSpacing: "-0.4px" }],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "11px",
        xl: "12px",
        "2xl": "24px",
        pill: "100px",
      },
      boxShadow: {
        // Memoir validated shadow tokens
        card: "0px 0.6px 1.57px -1.5px rgba(0,0,0,0.17), 0px 2px 5px -2px rgba(0,0,0,0.08), 0px 4px 12px -3px rgba(0,0,0,0.05)",
        "card-hover": "0px 2px 8px -1px rgba(0,0,0,0.12), 0px 6px 20px -4px rgba(0,0,0,0.08)",
        input: "inset 0px 0px 0px 1px rgba(0,0,0,0.20)",
        "input-focus": "inset 0px 0px 0px 1.5px #C8854A, 0 0 0 3px rgba(200,133,74,0.15)",
      },
      spacing: {
        xs: "2px",
        sm: "4px",
        "md-sm": "8px",
        md: "10px",
        "md-lg": "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "36px",
        "5xl": "40px",
        "6xl": "48px",
        hero: "80px",
      },
    },
  },
  plugins: [],
};
