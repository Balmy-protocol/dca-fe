export const baseColors = {
  black: '#000',
  white: '#FFF',
  violet: {
    violet100: '#fbfaff',
    violet200: '#e9e5ff',
    violet300: '#d0ccff',
    violet400: '#a399ff',
    violet500: '#791aff',
    violet600: '#430099',
    violet700: '#270c51',
    violet800: '#160033',
    violet900: '#0c001a',
  },
  aqua: {
    aqua100: '#f0fffb',
    aqua200: '#cdfef2',
    aqua300: '#9cfce5',
    aqua400: '#39f9ca',
    aqua500: '#07f8bd',
    aqua600: '#07dfaa',
    aqua700: '#049571',
    aqua800: '#024a39',
    aqua900: '#011913',
  },
  greyscale: {
    greyscale0: '#fbf7ff',
    greyscale1: '#f9f5ff',
    greyscale2: '#efebf5',
    greyscale3: '#e6e1ed',
    greyscale4: '#cdc8d3',
    greyscale5: '#9f98a9',
    greyscale6: '#797380',
    greyscale7: '#635f69',
    greyscale8: '#2f2d32',
    greyscale9: '#121113',
  },
  disabledText: 'rgba(255, 255, 255, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  backgroundGrid: '#fcfaff',
  dropShadow: {
    dropShadow100:
      '0px 1px 2px 0px rgba(45, 12, 95, 0.05), 0px 3px 3px 0px rgba(45, 12, 95, 0.04), 0px 7px 4px 0px rgba(45, 12, 95, 0.03), 0px 13px 5px 0px rgba(45, 12, 95, 0.01), 0px 20px 6px 0px rgba(45, 12, 95, 0.00)',
    dropShadow200:
      '0px 2px 5px 0px rgba(45, 12, 95, 0.08), 0px 9px 9px 0px rgba(45, 12, 95, 0.07), 0px 20px 12px 0px rgba(45, 12, 95, 0.04), 0px 35px 14px 0px rgba(45, 12, 95, 0.01), 0px 55px 15px 0px rgba(45, 12, 95, 0.00)',
    dropShadow300:
      '0px 3px 7px 0px rgba(45, 12, 95, 0.12), 0px 13px 13px 0px rgba(45, 12, 95, 0.10), 0px 30px 18px 0px rgba(45, 12, 95, 0.06), 0px 53px 21px 0px rgba(45, 12, 95, 0.02), 0px 83px 23px 0px rgba(45, 12, 95, 0.00)',
    dropShadow400:
      '0px 8px 18px 0px rgba(45, 12, 95, 0.09), 0px 34px 34px 0px rgba(45, 12, 95, 0.08), 0px 75px 45px 0px rgba(45, 12, 95, 0.05), 0px 134px 54px 0px rgba(45, 12, 95, 0.01), 0px 209px 59px 0px rgba(45, 12, 95, 0.00)',
  },
};

export const colors = {
  dark: {
    semantic: {
      success: {
        primary: '#21FC88',
        darker: '#21F485',
        light: '#53ED9B',
      },
      warning: {
        primary: '#FCD124',
        darker: '#FCDA55',
        light: '#493B03',
      },
      error: {
        primary: '#FC2424',
        darker: '#FC5555',
        light: '#F85454',
      },
    },
    semanticBackground: {
      success: 'rgba(83, 249, 161, 0.1)',
      warning: 'rgba(73, 59, 3, 0.1)',
      error: 'rgba(252, 85, 85, 0.1)',
    },
    background: {
      primary: '#10061E',
      secondary: '#1F0E37',
      tertiary: '#24103F',
      quartery: '#1F0E3766',
      quarteryNoAlpha: '#130526',
      emphasis: '#2B134D',
    },
    aqua: {
      aqua100: baseColors.aqua.aqua900,
      aqua200: baseColors.aqua.aqua800,
      aqua300: baseColors.aqua.aqua700,
      aqua400: baseColors.aqua.aqua600,
      aqua500: baseColors.aqua.aqua500,
      aqua600: baseColors.aqua.aqua400,
      aqua700: baseColors.aqua.aqua300,
      aqua800: baseColors.aqua.aqua200,
      aqua900: baseColors.aqua.aqua100,
    },
    violet: {
      violet100: baseColors.violet.violet900,
      violet200: baseColors.violet.violet800,
      violet300: baseColors.violet.violet700,
      violet400: baseColors.violet.violet600,
      violet500: baseColors.violet.violet500,
      violet600: baseColors.violet.violet400,
      violet700: baseColors.violet.violet300,
      violet800: baseColors.violet.violet200,
      violet900: baseColors.violet.violet100,
    },

    typography: {
      typo1: '#FFFFFF',
      typo2: '#BFB7CB',
      typo3: '#877C97',
      typo4: '#BFB7CB',
    },

    border: {
      border1: '#392554',
      border2: '#33214C',
    },
    accentPrimary: baseColors.aqua.aqua500,
    sematicWarning: '#FFD11A',
  },
  light: {
    semantic: {
      success: {
        primary: '#1EE57C',
        darker: '#06AC54',
        light: '#53ED9B',
      },
      warning: {
        primary: '#F5CB23',
        darker: '#DCB20A',
        light: '#F8D754',
      },
      error: {
        primary: '#F52323',
        darker: '#AB0707',
        light: '#F85454',
      },
    },
    semanticBackground: {
      success: 'rgba(6, 172, 84, 0.1)',
      warning: 'rgba(248, 215, 84, 0.1)',
      error: 'rgba(171, 7, 7, 0.1)',
    },
    background: {
      primary: '#EBE4F5',
      secondary: '#F4F2F7',
      tertiary: '#F9F7FC',
      quartery: '#F4F2F766',
      quarteryNoAlpha: '#eeeaf6',
      emphasis: '#EDEBF0',
    },
    aqua: {
      aqua100: baseColors.aqua.aqua100,
      aqua200: baseColors.aqua.aqua200,
      aqua300: baseColors.aqua.aqua300,
      aqua400: baseColors.aqua.aqua400,
      aqua500: baseColors.aqua.aqua500,
      aqua600: baseColors.aqua.aqua600,
      aqua700: baseColors.aqua.aqua700,
      aqua800: baseColors.aqua.aqua800,
      aqua900: baseColors.aqua.aqua900,
    },
    violet: {
      violet100: baseColors.violet.violet100,
      violet200: baseColors.violet.violet200,
      violet300: baseColors.violet.violet300,
      violet400: baseColors.violet.violet400,
      violet500: baseColors.violet.violet500,
      violet600: baseColors.violet.violet600,
      violet700: baseColors.violet.violet700,
      violet800: baseColors.violet.violet800,
      violet900: baseColors.violet.violet900,
    },
    typography: {
      typo1: '#312049',
      typo2: '#4A3A61',
      typo3: '#877C97',
      typo4: '#BFB7CB',
    },
    border: {
      border1: '#F9F7FD',
      border2: '#EFECF3',
    },
    accentPrimary: baseColors.violet.violet500,
    sematicWarning: '#F5C919',
  },
};
