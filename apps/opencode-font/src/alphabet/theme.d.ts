import { type Glyph, type CellType } from './types';
export declare const themeType: {
  readonly LIGHT: 'light';
  readonly DARK: 'dark';
};
export type ThemeType = (typeof themeType)[keyof typeof themeType];
export type Theme = {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
};
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export declare const getColorFromLetter: (_glyph: Glyph, theme: ThemeType, cell: CellType) => string;
