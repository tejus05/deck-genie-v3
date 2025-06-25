import { useCallback } from "react";

export interface FooterProperties {
  logoProperties: {
    showLogo: boolean;
    logoPosition: string;
    opacity: number;
    logoImage: {
      light: string;
      dark: string;
    };
  };
  logoScale: number;
  logoOffset: {
    x: number;
    y: number;
  };
  footerMessage: {
    showMessage: boolean;
    opacity: number;
    fontSize: number;
    message: string;
  };
}

// Client-side service for footer properties
export const useFooterService = () => {
  // Get footer properties
  const getFooterProperties = useCallback(
    async (): Promise<FooterProperties | null> => {
      try {
        const stored = localStorage.getItem('deck-genie-footer-properties');
        if (stored) {
          return JSON.parse(stored);
        }
        
        // Return default properties if none stored
        return {
          logoProperties: {
            showLogo: true,
            logoPosition: 'bottom-left',
            opacity: 0.8,
            logoImage: {
              light: '',
              dark: ''
            }
          },
          logoScale: 1,
          logoOffset: { x: 0, y: 0 },
          footerMessage: {
            showMessage: false,
            opacity: 0.8,
            fontSize: 12,
            message: ''
          }
        };
      } catch (error) {
        console.error("Error retrieving footer properties:", error);
        return null;
      }
    },
    []
  );

  // Save footer properties
  const saveFooterProperties = useCallback(
    async (properties: FooterProperties): Promise<boolean> => {
      try {
        localStorage.setItem('deck-genie-footer-properties', JSON.stringify(properties));
        return true;
      } catch (error) {
        console.error("Error saving footer properties:", error);
        return false;
      }
    },
    []
  );

  // Reset footer properties
  const resetFooterProperties = useCallback(
    async (defaultProperties: FooterProperties): Promise<boolean> => {
      return saveFooterProperties(defaultProperties);
    },
    [saveFooterProperties]
  );

  return {
    getFooterProperties,
    saveFooterProperties,
    resetFooterProperties,
  };
}; 