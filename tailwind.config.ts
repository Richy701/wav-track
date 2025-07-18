import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
	darkMode: "class",
	content: [
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	safelist: [
		{
			pattern: /^(flex|grid)-(row|col)-(1|2|3|4|5|6|8|10|12)$/,
			variants: ['responsive']
		},
		{
			pattern: /^scrollbar-(thin|none)$/,
			variants: ['responsive']
		},
		{
			pattern: /^select-(none|text|all|auto)$/,
			variants: ['responsive']
		},
		{
			pattern: /^duration-\[800ms\]$/,
			variants: ['responsive']
		}
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			maxWidth: {
				container: "1280px",
			},
			fontFamily: {
				sans: ['Outfit', 'sans-serif'],
				heading: ['Clash Display', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			backgroundImage: {
				'midnight-gradient': 'radial-gradient(circle at top left, #1E1B4B, #111728)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				black: '#000000',
				midnight: {
					background: '#111728',
					card: '#1A1F36',
					accent: '#A78BFA',
					text: 'hsl(0 0% 95%)',
					muted: 'hsl(240 5% 64.9%)',
					border: '#2A2F45'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					active: 'hsl(var(--primary-active))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))',
					active: 'hsl(var(--secondary-active))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					hover: 'hsl(var(--destructive-hover))',
					active: 'hsl(var(--destructive-active))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					hover: 'hsl(var(--muted-hover))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))',
					active: 'hsl(var(--accent-active))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
					border: 'hsl(var(--popover-border))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					hover: 'hsl(var(--card-hover))',
					border: 'hsl(var(--card-border))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
					hover: 'hsl(var(--sidebar-hover))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.85' }
				},
				progress: {
					'0%': { width: '0%' },
					'100%': { width: '100%' },
				},
				marquee: {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(calc(-33.33% - 16px))' }
				},
				grid: {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(calc(var(--cell-size) * -1))' }
				},
				'star-movement-bottom': {
					'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
					'100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
				},
				'star-movement-top': {
					'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
					'100%': { transform: 'translate(100%, 0%)', opacity: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'progress': 'progress 2s linear infinite',
				'marquee': 'marquee 30s linear infinite',
				'grid': 'grid 20s linear infinite',
				'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
				'star-movement-top': 'star-movement-top linear infinite alternate',
			},
			utilities: {
				'.pause': {
					'animation-play-state': 'paused',
				},
			}
		}
	},
	plugins: [animate],
	future: {
		hoverOnlyWhenSupported: true,
		respectDefaultRingColorOpacity: true,
		disableColorOpacityUtilitiesByDefault: true,
	},
	corePlugins: {
		float: false,
		clear: false,
		skew: false,
		scale: false,
		filter: false,
		backdropFilter: false,
		container: true,
		objectFit: true,
		objectPosition: true,
	},
} satisfies Config;

export default config;
