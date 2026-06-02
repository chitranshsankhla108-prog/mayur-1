import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-sans)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Fill for form controls — adapts dark (storefront) / white (admin).
        field: "hsl(var(--field))",
        // Brand tokens — crimson red
        crimson: {
          DEFAULT: "#C8102E",
          50: "#fdf2f4",
          100: "#fce2e6",
          200: "#f8b9c2",
          300: "#f1899a",
          400: "#e6536c",
          500: "#d92444",
          600: "#C8102E",
          700: "#a50f28",
          800: "#850e22",
          900: "#6b0f1e",
        },
        /*
         * Neutral surface scale. Repurposed as light grays for the light
         * storefront — `bg-ink-700` etc. (image placeholders, input fills,
         * tiles, section bands) now resolve to calm off-whites automatically.
         */
        ink: {
          DEFAULT: "#fbfbfc",
          800: "#f6f7f9",
          700: "#eef0f3",
          600: "#e6e8ec",
          500: "#dcdfe4",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Soft, premium elevation tuned for a light retail surface.
        glow: "0 0 0 1px rgba(200,16,46,0.12), 0 12px 30px -16px rgba(17,24,39,0.18)",
        "glow-sm": "0 2px 8px -2px rgba(200,16,46,0.25)",
        card: "0 1px 2px rgba(17,24,39,0.04), 0 1px 3px rgba(17,24,39,0.06)",
        lift: "0 12px 28px -12px rgba(17,24,39,0.16)",
      },
      backgroundImage: {
        // Faint dark hairline grid — works on light surfaces.
        "grid-dark":
          "linear-gradient(to right, rgba(17,24,39,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(55% 55% at 70% 25%, rgba(200,16,46,0.08) 0%, rgba(200,16,46,0) 62%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
