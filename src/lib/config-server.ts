import { readFile } from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";

import { ChatConfig, defaultConfig, mergeConfig } from "./config";

const CONFIG_FILES = ["settings.yaml", "chat-config.yaml"];

// Load chat openers from separate file on server
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
