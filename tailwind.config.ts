
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',  // Reduced from 2rem for compact layout
			screens: {
				'2xl': '1400px'
			}
		},
		fontFamily: {
			sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
			display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				brand: {
					teal: "#20c996",
					darkteal: "#179771",
					light: "#e6faf5",
					green: "#1ab386",
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Design System Colors for Mentorship Page Redesign
				mentorship: {
					// Primary Colors
					'primary-blue': '#2563eb',      // blue-600
					'primary-purple': '#7c3aed',    // purple-600
					'success-green': '#16a34a',     // green-600
					'warning-orange': '#ea580c',    // orange-600
					'error-red': '#dc2626',         // red-600
					// Neutral Colors
					'gray-900': '#111827',
					'gray-700': '#374151',
					'gray-500': '#6b7280',
					'gray-200': '#e5e7eb',
					'gray-100': '#f3f4f6',
					'gray-50': '#f9fafb',
					// Semantic Background Pairings
					'success-bg': '#f0fdf4',        // green-50
					'warning-bg': '#fff7ed',        // orange-50
					'error-bg': '#fef2f2',          // red-50
					'info-bg': '#eff6ff',           // blue-50
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Design System Border Radius
				'mentorship-sm': '8px',   // Small elements
				'mentorship-md': '12px',  // Cards, inputs
				'mentorship-lg': '16px',  // Major sections
			},
			spacing: {
				// Design System Spacing (4px base unit)
				'mentorship-xs': '8px',   // 2 units
				'mentorship-sm': '12px',  // 3 units
				'mentorship-md': '16px',  // 4 units
				'mentorship-lg': '20px',  // 5 units
				'mentorship-xl': '24px',  // 6 units
				'mentorship-2xl': '32px', // 8 units
			},
			fontSize: {
				// Design System Typography Scale
				'mentorship-display': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
				'mentorship-heading': ['20px', { lineHeight: '1.2', fontWeight: '700' }],
				'mentorship-subheading': ['18px', { lineHeight: '1.5', fontWeight: '700' }],
				'mentorship-body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
				'mentorship-body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
				'mentorship-caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
				'mentorship-label': ['12px', { lineHeight: '1.4', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }],
			},
			boxShadow: {
				// Design System Shadows
				'mentorship-subtle': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'mentorship-default': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				'mentorship-medium': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				'mentorship-large': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				'mentorship-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
			},
			transitionDuration: {
				// Design System Transitions
				'mentorship-fast': '200ms',
				'mentorship-normal': '300ms',
				'mentorship-slow': '400ms',
			},
			transitionTimingFunction: {
				// Design System Easing
				'mentorship': 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				// Design System Animations
				'mentorship-fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'mentorship-slide-in': {
					'0%': { opacity: '0', transform: 'translateX(-10px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				'mentorship-scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				// Design System Animations
				'mentorship-fade-in': 'mentorship-fade-in 0.3s ease-out',
				'mentorship-slide-in': 'mentorship-slide-in 0.3s ease-out',
				'mentorship-scale-in': 'mentorship-scale-in 0.2s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
