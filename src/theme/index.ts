// src/theme/index.ts

export const theme = {
  colors: {
    // Sfondi
    background: '#121214', // Antracite molto scuro
    surface: '#1C1C1F',    // Leggermente più chiaro per le card
    surfaceHighlight: '#27272A', // Per elementi attivi o premuti

    // Testi
    text: '#F8FAFC',       // Bianco ghiaccio
    textMuted: '#94A3B8',  // Grigio neutro per testi secondari

    // Accenti e Stati
    primary: '#7C3AED',    // Viola elettrico (Brand)
    primaryMuted: '#5B21B6',
    success: '#10B981',    // Verde (Task completato)
    error: '#EF4444',      // Rosso (Ritardi, eliminazioni)
    warning: '#F59E0B',    // Arancione
    
    // Bordi
    border: '#27272A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  }
} as const;

export type ThemeColors = keyof typeof theme.colors;