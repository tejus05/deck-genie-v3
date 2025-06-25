"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  FooterProperties,
  useFooterService,
} from "../services/footerService";
import { clearLogs, logOperation } from "../utils/log";

// Default footer properties
export const defaultFooterProperties: FooterProperties = {
  logoProperties: {
    showLogo: false,
    logoPosition: "left",
    opacity: 0.8,
    logoImage: {
      light: "",
      dark: "",
    },
  },
  logoScale: 1.0,
  logoOffset: {
    x: 0,
    y: 0,
  },
  footerMessage: {
    showMessage: false,
    opacity: 1.0,
    fontSize: 12,
    message: "",
  },
};

interface FooterContextProps {
  footerProperties: FooterProperties;
  setFooterProperties: (newProperties: FooterProperties | ((prev: FooterProperties) => FooterProperties)) => void;
  resetFooterProperties: () => Promise<void>;
  saveFooterProperties: (newProperties: FooterProperties) => Promise<void>;
}

const FooterContext = createContext<FooterContextProps | undefined>(undefined);

export const useFooterContext = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error("useFooterContext must be used within a FooterProvider");
  }
  return context;
};

export const FooterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [footerProperties, setFooterProperties] = useState<FooterProperties>(defaultFooterProperties);
  const footerService = useFooterService();

  // Load footer properties only once when the provider mounts
  useEffect(() => {
    const loadFooterProperties = async () => {
      try {
        logOperation('Loading footer properties');
        const properties = await footerService.getFooterProperties();
        if (properties) {
          logOperation('Footer properties loaded successfully');
          setFooterProperties(properties);
        } else {
          logOperation('No footer properties found, using defaults');
        }
      } catch (error) {
        logOperation(`Error loading footer properties: ${error}`);
        console.error("Failed to load footer properties:", error);
      }
    };

    loadFooterProperties();
  }, []); // Empty dependency array ensures this runs only once

  const resetFooterProperties = async () => {
    try {
      logOperation('Resetting footer properties to defaults');
      const success = await footerService.resetFooterProperties(defaultFooterProperties);
      if (success) {
        logOperation('Footer properties reset successfully');
        setFooterProperties(defaultFooterProperties);
      } else {
        logOperation('Failed to reset footer properties');
      }
    } catch (error) {
      logOperation(`Error resetting footer properties: ${error}`);
      console.error("Failed to reset footer properties:", error);
    }
  };

  const saveFooterProperties = async (newProperties: FooterProperties) => {
    try {
      logOperation('Saving new footer properties');
      const success = await footerService.saveFooterProperties(newProperties);
      if (success) {
        logOperation('Footer properties saved successfully');
        setFooterProperties(newProperties);
      } else {
        logOperation('Failed to save footer properties');
      }
    } catch (error) {
      logOperation(`Error saving footer properties: ${error}`);
      console.error("Failed to save footer properties:", error);
    }
  };

  return (
    <FooterContext.Provider
      value={{
        footerProperties,
        setFooterProperties,
        resetFooterProperties,
        saveFooterProperties,
      }}
    >
      {children}
    </FooterContext.Provider>
  );
};
