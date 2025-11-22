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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xs': '475px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
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
				upload: {
					zone: 'hsl(var(--upload-zone))',
					'zone-hover': 'hsl(var(--upload-zone-hover))',
					'zone-active': 'hsl(var(--upload-zone-active))',
					progress: 'hsl(var(--upload-progress))',
					success: 'hsl(var(--upload-success))',
					error: 'hsl(var(--upload-error))'
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
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in-from-top': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)' },
					'50%': { boxShadow: '0 0 0 20px hsl(var(--primary) / 0.1)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'glow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'gradient-x': {
					'0%, 100%': { 
						'background-position': '0% 50%'
					},
					'50%': { 
						'background-position': '100% 50%'
					}
				},
				'bounce-slow': {
					'0%, 100%': { 
						transform: 'translateY(-5%)',
						'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': { 
						transform: 'translateY(0)',
						'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				'border-beam': {
					'0%': { 
						'offset-distance': '0%'
					},
					'100%': { 
						'offset-distance': '100%'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'float': 'float 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'gradient-x': 'gradient-x 3s ease infinite',
				'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
				'border-beam': 'border-beam 2s linear infinite'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-upload': 'var(--gradient-upload)',
				'gradient-success': 'var(--gradient-success)',
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-mesh': 'var(--gradient-mesh)',
				'gradient-border': 'var(--gradient-border)',
				'gradient-shimmer': 'var(--gradient-shimmer)'
			},
			boxShadow: {
				'upload': 'var(--shadow-upload)',
				'card': 'var(--shadow-card)',
				'hover': 'var(--shadow-hover)',
				'glow': 'var(--shadow-glow)',
				'premium': 'var(--shadow-premium)',
				'glass': 'var(--shadow-glass)',
				'inner': 'var(--shadow-inner)',
				'border': 'var(--shadow-border)'
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
