import React, { createContext, useContext, useEffect } from 'react';
import { theme, getCSSVariables } from '@/styles/theme';

interface ThemeContextType {
  theme: typeof theme;
  getColor: (colorPath: string) => string;
  getComponentClass: (component: string, variant?: string, size?: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    // Apply CSS custom properties to root
    const root = document.documentElement;
    const cssVars = getCSSVariables();
    
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, []);

  const getColor = (colorPath: string): string => {
    const keys = colorPath.split('.');
    let value: any = theme.colors;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value || colorPath;
  };

  const getComponentClass = (component: string, variant?: string, size?: string): string => {
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

  const contextValue: ThemeContextType = {
    theme,
    getColor,
    getComponentClass
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
