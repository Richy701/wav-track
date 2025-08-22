/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    // Dynamic classes that need to be preserved
    {
      pattern: /^(bg|text|border)-(primary|secondary|accent|success|warning|error|info)/,
      variants: ['hover', 'focus', 'active', 'disabled'],
    },
    {
      pattern: /^(w|h)-(full|screen|auto|min|max)/,
    },
    {
      pattern: /^(p|m)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48)/,
    },
    {
      pattern: /^(grid-cols|grid-rows)-(1|2|3|4|5|6|7|8|9|10|11|12)/,
    },
    {
      pattern: /^(col-span|row-span)-(1|2|3|4|5|6|7|8|9|10|11|12|full)/,
    },
    {
      pattern: /^(gap)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48)/,
    },
    {
      pattern: /^(rounded)-(none|sm|md|lg|xl|2xl|3xl|full)/,
    },
    {
      pattern: /^(shadow)-(none|sm|md|lg|xl|2xl|3xl|inner)/,
    },
    {
      pattern: /^(opacity)-(0|25|50|75|100)/,
    },
    {
      pattern: /^(scale)-(0|50|75|90|95|100|105|110|125|150)/,
    },
    {
      pattern: /^(rotate)-(0|1|2|3|6|12|45|90|180)/,
    },
    {
      pattern: /^(translate)-(x|y)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64|72|80|96)/,
    },
    {
      pattern: /^(blur)-(none|sm|md|lg|xl|2xl|3xl)/,
    },
    {
      pattern: /^(backdrop-blur)-(none|sm|md|lg|xl|2xl|3xl)/,
    },
    {
      pattern: /^(filter)-(none|blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia)/,
    },
    {
      pattern: /^(transition)-(all|none|colors|opacity|shadow|transform)/,
    },
    {
      pattern: /^(duration)-(75|100|150|200|300|500|700|1000)/,
    },
    {
      pattern: /^(ease)-(linear|in|out|in-out)/,
    },
    {
      pattern: /^(delay)-(75|100|150|200|300|500|700|1000)/,
    },
    {
      pattern: /^(animate)-(none|spin|ping|pulse|bounce|fade-in|fade-out|slide-in|slide-out|zoom-in|zoom-out)/,
    },
    {
      pattern: /^(cursor)-(auto|default|pointer|wait|text|move|help|not-allowed)/,
    },
    {
      pattern: /^(pointer-events)-(none|auto)/,
    },
    {
      pattern: /^(resize)-(none|y|x|both)/,
    },
    {
      pattern: /^(select)-(none|text|all|auto)/,
    },
    {
      pattern: /^(whitespace)-(normal|nowrap|pre|pre-line|pre-wrap)/,
    },
    {
      pattern: /^(break)-(normal|words|all)/,
    },
    {
      pattern: /^(overflow)-(auto|hidden|clip|visible|scroll)/,
    },
    {
      pattern: /^(overflow-x)-(auto|hidden|clip|visible|scroll)/,
    },
    {
      pattern: /^(overflow-y)-(auto|hidden|clip|visible|scroll)/,
    },
    {
      pattern: /^(overscroll)-(auto|contain|none)/,
    },
    {
      pattern: /^(overscroll-x)-(auto|contain|none)/,
    },
    {
      pattern: /^(overscroll-y)-(auto|contain|none)/,
    },
    {
      pattern: /^(scroll)-(auto|smooth)/,
    },
    {
      pattern: /^(touch)-(auto|none|manipulation)/,
    },
    {
      pattern: /^(select)-(none|text|all|auto)/,
    },
    {
      pattern: /^(will-change)-(auto|scroll-position|contents|transform)/,
    },
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontSize: {
  			'fluid-sm': 'clamp(0.8rem, 0.17vw + 0.76rem, 0.89rem)',
  			'fluid-base': 'clamp(1rem, 0.34vw + 0.91rem, 1.19rem)',
  			'fluid-lg': 'clamp(1.25rem, 0.61vw + 1.1rem, 1.58rem)',
  			'fluid-xl': 'clamp(1.56rem, 1vw + 1.31rem, 2.11rem)',
  			'fluid-2xl': 'clamp(1.95rem, 1.56vw + 1.56rem, 2.81rem)'
  		},
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
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  		fontFamily: {
  			sans: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Oxygen',
  				'Ubuntu',
  				'Cantarell',
  				'sans-serif'
  			],
  			display: [
  				'Clash Display',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Oxygen',
  				'Ubuntu',
  				'Cantarell',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}