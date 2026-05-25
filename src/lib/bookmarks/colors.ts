export const CATEGORY_COLOR_PRESETS = [
  {
    id: 'blue',
    labelKey: 'color_blue',
    foreground: '#2563eb',
    background: 'rgba(37, 99, 235, 0.12)',
    border: 'rgba(37, 99, 235, 0.32)',
  },
  {
    id: 'emerald',
    labelKey: 'color_emerald',
    foreground: '#059669',
    background: 'rgba(5, 150, 105, 0.12)',
    border: 'rgba(5, 150, 105, 0.32)',
  },
  {
    id: 'amber',
    labelKey: 'color_amber',
    foreground: '#d97706',
    background: 'rgba(217, 119, 6, 0.14)',
    border: 'rgba(217, 119, 6, 0.34)',
  },
  {
    id: 'rose',
    labelKey: 'color_rose',
    foreground: '#e11d48',
    background: 'rgba(225, 29, 72, 0.12)',
    border: 'rgba(225, 29, 72, 0.32)',
  },
  {
    id: 'violet',
    labelKey: 'color_violet',
    foreground: '#7c3aed',
    background: 'rgba(124, 58, 237, 0.12)',
    border: 'rgba(124, 58, 237, 0.32)',
  },
  {
    id: 'cyan',
    labelKey: 'color_cyan',
    foreground: '#0891b2',
    background: 'rgba(8, 145, 178, 0.12)',
    border: 'rgba(8, 145, 178, 0.32)',
  },
] as const;

export type CategoryColorId = (typeof CATEGORY_COLOR_PRESETS)[number]['id'];

export const DEFAULT_CATEGORY_COLOR: CategoryColorId = 'blue';

export const isCategoryColorId = (value: string): value is CategoryColorId =>
  CATEGORY_COLOR_PRESETS.some((preset) => preset.id === value);

export const normalizeCategoryColor = (value: string): CategoryColorId =>
  isCategoryColorId(value) ? value : DEFAULT_CATEGORY_COLOR;

export const getCategoryColorPreset = (color: string) =>
  CATEGORY_COLOR_PRESETS.find((preset) => preset.id === color) ??
  CATEGORY_COLOR_PRESETS[0];
