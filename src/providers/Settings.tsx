import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ChatConfig, defaultConfig, loadConfig } from "@/lib/config";

// User settings that can be customized in the UI
export interface UserSettings {
  fontFamily: "sans" | "serif" | "mono" | "pretendard";
  fontSize: "small" | "medium" | "large";
  colorScheme: "light" | "dark" | "auto";
  autoCollapseToolCalls: boolean;
  chatWidth: "default" | "wide";
}

export interface SettingsContextType {
  config: ChatConfig;
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  resetUserSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "agent-chat-user-settings";

// Load user settings from localStorage
function loadUserSettings(): Partial<UserSettings> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error loading user settings:", error);
    return {};
  }
}

// Save user settings to localStorage
function saveUserSettings(settings: UserSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving user settings:", error);
  }
}

interface SettingsProviderProps {
  children: ReactNode;
  initialConfig?: ChatConfig;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  initialConfig,
}) => {
  const initial = initialConfig ?? defaultConfig;
  const [config, setConfig] = useState<ChatConfig>(initial);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    fontFamily: initial.theme.fontFamily,
    fontSize: initial.theme.fontSize,
    colorScheme: initial.theme.colorScheme,
    autoCollapseToolCalls: initial.ui.autoCollapseToolCalls,
    chatWidth: initial.ui.chatWidth,
  });

  // Load config on mount
  useEffect(() => {
    if (initialConfig) return;
    loadConfig().then(setConfig);
  }, [initialConfig]);

  // Load user settings from localStorage after hydration
  useEffect(() => {
    const stored = loadUserSettings();
    setUserSettings({
      fontFamily: stored.fontFamily || initial.theme.fontFamily,
      fontSize: stored.fontSize || initial.theme.fontSize,
      colorScheme: stored.colorScheme || initial.theme.colorScheme,
      autoCollapseToolCalls:
        stored.autoCollapseToolCalls ?? initial.ui.autoCollapseToolCalls,
      chatWidth: stored.chatWidth || initial.ui.chatWidth,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply theme settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply font family
    const fontFamilyMap = {
      sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      pretendard: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
    };
    root.style.setProperty("--font-family", fontFamilyMap[userSettings.fontFamily]);

    // Apply font size
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    root.style.setProperty("--base-font-size", fontSizeMap[userSettings.fontSize]);

    // Apply color scheme
    if (userSettings.colorScheme === "auto") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    } else {
      root.classList.toggle("dark", userSettings.colorScheme === "dark");
    }
  }, [userSettings]);

  const updateUserSettings = (settings: Partial<UserSettings>) => {
    setUserSettings((prev) => {
      const newSettings = { ...prev, ...settings };
      saveUserSettings(newSettings);
      return newSettings;
    });
  };

  const resetUserSettings = () => {
    const defaultUserSettings: UserSettings = {
      fontFamily: config.theme.fontFamily,
      fontSize: config.theme.fontSize,
      colorScheme: config.theme.colorScheme,
      autoCollapseToolCalls: config.ui.autoCollapseToolCalls,
      chatWidth: config.ui.chatWidth,
    };
    setUserSettings(defaultUserSettings);
    saveUserSettings(defaultUserSettings);
  };

  return (
    <SettingsContext.Provider
      value={{ config, userSettings, updateUserSettings, resetUserSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
