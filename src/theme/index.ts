import { lightColors, darkColors, Colors } from './colors';

export interface Theme {
  colors: Colors;
  fonts: {
    display: string;
    displaySemibold: string;
    displayMedium: string;
    body: string;
    bodyMedium: string;
    bodySemibold: string;
    bodyBold: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    round: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

const baseTheme = {
  fonts: {
    display: 'PlayfairDisplay_700Bold',
    displaySemibold: 'PlayfairDisplay_600SemiBold',
    displayMedium: 'PlayfairDisplay_500Medium',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodySemibold: 'DMSans_600SemiBold',
    bodyBold: 'DMSans_700Bold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 22,
    xl: 28,
    xxl: 36,
    round: 999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  shadows: {
    small: {
      shadowColor: '#1E1B16',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    medium: {
      shadowColor: '#1E1B16',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 18,
      elevation: 6,
    },
    large: {
      shadowColor: '#1E1B16',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.16,
      shadowRadius: 30,
      elevation: 12,
    },
  },
};

export const lightTheme: Theme = {
  ...baseTheme,
  colors: lightColors,
};

export const darkTheme: Theme = {
  ...baseTheme,
  colors: darkColors,
};
