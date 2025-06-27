import { useCallback } from "react";
import { ThemeType } from "../upload/type";

export interface ThemeColors {
  background: string;
  slideBg: string;
  slideTitle: string;
  slideHeading: string;
  slideDescription: string;
  slideBox: string;
  accentColor: string;
  chartColors: string[];
  fontFamily: string;
  theme?: ThemeType;
}

export const useThemeService = () => {
  const getTheme = useCallback(async (): Promise<{
    name: string;
    colors: ThemeColors;
  } | null> => {
    try {
      const stored = localStorage.getItem('deck-genie-theme');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default theme if none stored
      return {
        name: 'Default',
        colors: {
          background: '#ffffff',
          slideBg: '#ffffff',
          slideTitle: '#000000',
          slideHeading: '#333333',
          slideDescription: '#666666',
          slideBox: '#f5f5f5',
          accentColor: '#e0e0e0',
          chartColors: ['#3366cc', '#dc3912', '#ff9900', '#109618'],
          fontFamily: 'Arial, sans-serif'
        }
      };
    } catch (error) {
      console.error("Error retrieving theme:", error);
      return null;
    }
  }, []);

  const saveTheme = useCallback(
    async (themeData: {
      name: string;
      colors: ThemeColors;
    }): Promise<boolean> => {
      try {
        localStorage.setItem('deck-genie-theme', JSON.stringify(themeData));
        return true;
      } catch (error) {
        console.error("Error saving theme:", error);
        return false;
      }
    },
    []
  );

  return {
    getTheme,
    saveTheme,
  };
}; 