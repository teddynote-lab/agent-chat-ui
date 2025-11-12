import { readFile } from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";

import { ChatConfig, defaultConfig, mergeConfig } from "./config";

const CONFIG_FILES = ["settings.yaml", "chat-config.yaml"];

/**
 * Loads chat openers from a separate YAML file on the server side.
 *
 * @returns Array of chat opener strings if successful, undefined otherwise
 */
async function loadServerChatOpeners(): Promise<string[] | undefined> {
  try {
    const filePath = path.join(process.cwd(), "public", "chat-openers.yaml");
    const contents = await readFile(filePath, "utf8");
    const data = yaml.load(contents) as { chatOpeners?: string[] };
    console.log("Server: chat-openers.yaml loaded successfully,", data.chatOpeners?.length, "items");
    return data.chatOpeners;
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      console.warn("Server: Failed to load chat-openers.yaml:", error);
    }
    return undefined;
  }
}

/**
 * Loads configuration from YAML files on the server side.
 *
 * Attempts to load configuration from multiple file sources in order:
 * 1. settings.yaml
 * 2. chat-config.yaml
 *
 * Also loads chat openers from a separate file (chat-openers.yaml) if available.
 * Falls back to the default configuration if no config files are found.
 *
 * @returns The loaded configuration merged with defaults, or the default config if no files are found
 */
export async function loadServerConfig(): Promise<ChatConfig> {
  let config: ChatConfig | null = null;

  for (const file of CONFIG_FILES) {
    try {
      const filePath = path.join(process.cwd(), "public", file);
      const contents = await readFile(filePath, "utf8");
      const parsed = yaml.load(contents) as Partial<ChatConfig>;
      config = mergeConfig(parsed);
      break;
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        console.error(`Failed to load ${file}:`, error);
      }
      // Try the next file if the current one doesn't exist.
    }
  }

  if (!config) {
    console.warn("Falling back to default config. No config file found on server.");
    config = defaultConfig;
  }

  // Load chat openers separately
  const chatOpeners = await loadServerChatOpeners();
  if (chatOpeners) {
    config.branding.chatOpeners = chatOpeners;
  }

  return config;
}
