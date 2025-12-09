import { cellType } from './types';
export const themeType = {
  LIGHT: 'light',
  DARK: 'dark',
};
export const lightTheme = {
  backgroundColor: '#FFFFFF',
  primaryColor: '#F1ECEC', // Light (OpenCode.ai)
  secondaryColor: '#B7B1B1', // Medium (OpenCode.ai)
  tertiaryColor: '#4B4646', // Dark (OpenCode.ai)
};
export const darkTheme = {
  backgroundColor: '#000000',
  primaryColor: '#F1ECEC', // Light (OpenCode.ai dark mode logo)
  secondaryColor: '#B7B1B1', // Medium (OpenCode.ai dark mode logo)
  tertiaryColor: '#4B4646', // Dark (OpenCode.ai dark mode logo)
};
export const getColorFromLetter = (_glyph, theme, cell) => {
  const themeData = theme === themeType.DARK ? darkTheme : lightTheme;
  switch (cell) {
    case cellType.PRIMARY:
      return themeData.primaryColor;
    case cellType.SECONDARY:
      return themeData.secondaryColor;
    case cellType.TERTIARY:
      return themeData.tertiaryColor;
    case cellType.BLANK:
    default:
      return themeData.backgroundColor;
  }
};
//# sourceMappingURL=theme.js.map
