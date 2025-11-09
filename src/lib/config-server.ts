import { readFile } from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";

import { ChatConfig, defaultConfig, mergeConfig } from "./config";

const CONFIG_FILES = ["settings.yaml", "chat-config.yaml"];

export async function loadServerConfig(): Promise<ChatConfig> {
  for (const file of CONFIG_FILES) {
    try {
      const filePath = path.join(process.cwd(), "public", file);
      const contents = await readFile(filePath, "utf8");
      const parsed = yaml.load(contents) as Partial<ChatConfig>;
      return mergeConfig(parsed);
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        console.error(`Failed to load ${file}:`, error);
      }
      // Try the next file if the current one doesn't exist.
    }
  }

  console.warn("Falling back to default config. No config file found on server.");
  return defaultConfig;
}
