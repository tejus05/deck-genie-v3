import type { Config } from "tailwindcss";
import scrollbarHide from 'tailwind-scrollbar-hide'


const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
	"!./app/privacy-policy/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
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
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'calc(var(--radius-xl) + 0.25rem)',
  			'3xl': 'calc(var(--radius-xl) + 0.5rem)'
  		},
  		boxShadow: {
  			'modern': 'var(--shadow-md)',
  			'modern-lg': 'var(--shadow-lg)',
  			'modern-xl': 'var(--shadow-xl)',
  			'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
  			'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)'
  		},
  		backdropBlur: {
  			xs: '2px',
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
  			fadeIn: {
  				'0%': { opacity: '0', transform: 'translateY(10px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			slideUp: {
  				'0%': { transform: 'translateY(100%)' },
  				'100%': { transform: 'translateY(0)' }
  			},
  			bounceGentle: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-5px)' }
  			},
  			pulseGentle: {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.8' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'bounce-gentle': 'bounceGentle 2s infinite',
  			'pulse-gentle': 'pulseGentle 3s ease-in-out infinite'
  		},
  		fontFamily: {
			'instrument_sans': ['var(--font-instrument-sans)', 'Inter', 'system-ui', 'sans-serif'],	
			'inter': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
			'roboto': ['var(--font-roboto)', 'Roboto', 'system-ui', 'sans-serif'],
			'fraunces': ['var(--font-fraunces)', 'Fraunces', 'serif'],
			'montserrat': ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
			'inria_serif': ['var(--font-inria-serif)', 'Inria Serif', 'serif'],
			'display': ['var(--font-fraunces)', 'Fraunces', 'serif'],
			'body': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif']
  		},
  	}
  },
  plugins: [require("tailwindcss-animate"),scrollbarHide,require('@tailwindcss/typography')],
};
export default config;
