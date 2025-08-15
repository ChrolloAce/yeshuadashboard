// Yeshua Cleaning Dashboard Theme System
export const theme = {
  // Primary Brand Colors
  colors: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2', 
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#7c2429', // Main brand color
      700: '#6b1f23',
      800: '#5a1a1d',
      900: '#4a1518',
      950: '#3a1013'
    },
    
    // Neutral Colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    },
    
    // Status Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }]
    },
    
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    }
  },
  
  // Spacing
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },
  
  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000'
  },
  
  // Component Styles
  components: {
    button: {
      base: 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      
      variants: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500'
      },
      
      sizes: {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-4 py-2 text-base',
        xl: 'px-6 py-3 text-base'
      }
    },
    
    input: {
      base: 'block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500',
      
      variants: {
        default: 'border-gray-300',
        error: 'border-error-300 focus:border-error-500 focus:ring-error-500',
        success: 'border-success-300 focus:border-success-500 focus:ring-success-500'
      },
      
      sizes: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base'
      }
    },
    
    card: {
      base: 'bg-white rounded-xl border border-gray-200 shadow-sm',
      
      variants: {
        default: 'border-gray-200',
        elevated: 'border-gray-200 shadow-lg',
        interactive: 'border-gray-200 hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer'
      }
    },
    
    badge: {
      base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      
      variants: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-error-100 text-error-800',
        info: 'bg-info-100 text-info-800'
      }
    }
  },
  
  // Animation
  animation: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  }
} as const;

// Theme utility functions
export const getColor = (colorPath: string): string => {
  const keys = colorPath.split('.');
  let value: any = theme.colors;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value || colorPath;
};

export const getSpacing = (space: keyof typeof theme.spacing): string => {
  return theme.spacing[space];
};

export const getComponentClass = (component: string, variant?: string, size?: string): string => {
  const comp = (theme.components as any)[component];
  if (!comp) return '';
  
  let classes = comp.base || '';
  
  if (variant && comp.variants?.[variant]) {
    classes += ` ${comp.variants[variant]}`;
  }
  
  if (size && comp.sizes?.[size]) {
    classes += ` ${comp.sizes[size]}`;
  }
  
  return classes;
};

// CSS Custom Properties for dynamic theming
export const getCSSVariables = () => {
  return {
    '--color-primary-50': theme.colors.primary[50],
    '--color-primary-100': theme.colors.primary[100],
    '--color-primary-200': theme.colors.primary[200],
    '--color-primary-300': theme.colors.primary[300],
    '--color-primary-400': theme.colors.primary[400],
    '--color-primary-500': theme.colors.primary[500],
    '--color-primary-600': theme.colors.primary[600],
    '--color-primary-700': theme.colors.primary[700],
    '--color-primary-800': theme.colors.primary[800],
    '--color-primary-900': theme.colors.primary[900],
    '--color-primary-950': theme.colors.primary[950],
  };
};

export default theme;
