/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
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
				agri: {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
					800: "#166534",
					900: "#14532d",
					950: "#052e16",
				},
				leaf: {
					50: "#ecfccb",
					100: "#d9f99d",
					200: "#bef264",
					300: "#a3e635",
					400: "#84cc16",
					500: "#65a30d",
					600: "#4d7c0f",
					700: "#3f6212",
					800: "#365314",
					900: "#2d4415",
					950: "#1a2e05",
				},
				earth: {
					50: "#fdf8f6",
					100: "#f2e8e5",
					200: "#eaddd7",
					300: "#e0cec7",
					400: "#d2bab0",
					500: "#a18072",
					600: "#8a6a5c",
					700: "#725548",
					800: "#5d453b",
					900: "#4e3d36",
					950: "#2b211d",
				},
				sand: {
					50: "#fdfbf7",
					100: "#fbf7ef",
					200: "#f6eedd",
					300: "#efe0c3",
					400: "#e5cc9f",
					500: "#dcb277",
					600: "#cd9456",
					700: "#aa7542",
					800: "#8b5e3b",
					900: "#724e35",
					950: "#3f291a",
				},
			},
			fontFamily: {
				sans: ['"Plus Jakarta Sans"', 'sans-serif'],
				display: ['"Outfit"', 'sans-serif'],
			},
			animation: {
				"fade-in": "fadeIn 1s ease-in-out",
				"slide-up": "slideUp 0.8s ease-out",
				"slide-down": "slideDown 0.8s ease-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				slideDown: {
					"0%": { transform: "translateY(-20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
