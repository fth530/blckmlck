import type { BoardTheme } from './types';

export const ALL_THEMES: BoardTheme[] = [
  {
    id: 'cosmic',
    name: 'Cosmic',
    price: 0,
    bgGradient: ['#0d0d1a', '#13132a', '#0d0d1a'],
    boardBg: '#1a1a2e',
    cellBorder: '#252545',
    cellEmpty: '#1e1e38',
    accent: '#6C5CE7',
    accentLight: '#A29BFE',
    trayBg: 'rgba(10,10,24,0.85)',
  },
  {
    id: 'neon',
    name: 'Neon',
    price: 200,
    bgGradient: ['#0a0a0a', '#0d1117', '#0a0a0a'],
    boardBg: '#111318',
    cellBorder: '#1a2030',
    cellEmpty: '#0f1520',
    accent: '#39FF14',
    accentLight: '#7CFF5C',
    trayBg: 'rgba(10,15,10,0.85)',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    price: 300,
    bgGradient: ['#0a1628', '#0d1f3c', '#0a1628'],
    boardBg: '#0f2240',
    cellBorder: '#1a3355',
    cellEmpty: '#0d1d38',
    accent: '#00B4D8',
    accentLight: '#48CAE4',
    trayBg: 'rgba(8,18,36,0.85)',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    price: 300,
    bgGradient: ['#1a0a0a', '#2d1216', '#1a0a0a'],
    boardBg: '#2a1215',
    cellBorder: '#3d2025',
    cellEmpty: '#241018',
    accent: '#FF6B35',
    accentLight: '#FF9F6B',
    trayBg: 'rgba(20,8,8,0.85)',
  },
  {
    id: 'forest',
    name: 'Forest',
    price: 400,
    bgGradient: ['#0a1a0d', '#0f2a14', '#0a1a0d'],
    boardBg: '#122e16',
    cellBorder: '#1d3f22',
    cellEmpty: '#0f2613',
    accent: '#2ECC71',
    accentLight: '#58D68D',
    trayBg: 'rgba(8,18,10,0.85)',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    price: 500,
    bgGradient: ['#1a0d18', '#2d1428', '#1a0d18'],
    boardBg: '#2a1525',
    cellBorder: '#3d2238',
    cellEmpty: '#241120',
    accent: '#FF69B4',
    accentLight: '#FF99CC',
    trayBg: 'rgba(20,8,18,0.85)',
  },
];

export const DEFAULT_THEME_ID = 'cosmic';

export function getThemeById(id: string): BoardTheme {
  return ALL_THEMES.find((t) => t.id === id) ?? ALL_THEMES[0];
}
