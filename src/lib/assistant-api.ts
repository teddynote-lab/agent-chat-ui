import { createClient } from "@/providers/client";

/**
 * Valid fields for assistant selection
 * Based on @langchain/langgraph-sdk's assistant schema
 */
type AssistantSelectField =
  | "assistant_id"
  | "graph_id"
  | "config"
  | "created_at"
  | "updated_at"
  | "metadata"
  | "name";

export interface AssistantConfig {
  configurable?: Record<string, any>;
  [key: string]: any;
}

export interface Assistant {
  assistant_id: string;
  graph_id: string;
  config: AssistantConfig;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  name?: string;
  description?: string;
  version?: number;
  context?: Record<string, any>;
}

export interface AssistantSchemas {
  graph_id: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  state_schema: Record<string, any>;
  config_schema: Record<string, any>;
  context_schema: Record<string, any>;
}

export interface SearchAssistantsRequest {
  graph_id?: string;
  limit?: number;
  offset?: number;
  metadata?: Record<string, unknown>;
  sort_by?: "assistant_id" | "created_at" | "updated_at" | "name" | "graph_id";
  sort_order?: "asc" | "desc";
  select?: AssistantSelectField[];
}

export async function getAssistant(
  apiUrl: string,
  assistantId: string,
  apiKey?: string
): Promise<Assistant | null> {
  if (!assistantId) {
    console.warn("Assistant ID is missing, skipping assistant API call");
    return null;
  }

  try {
    const client = createClient(apiUrl, apiKey);
    const assistant = await client.assistants.get(assistantId);
    return assistant as Assistant;
  } catch (error) {
    console.error(`Failed to fetch assistant "${assistantId}":`, error);
    return null;
  }
}

export async function searchAssistants(
  apiUrl: string,
  request: SearchAssistantsRequest,
  apiKey?: string
): Promise<Assistant[]> {
  try {
    const client = createClient(apiUrl, apiKey);
    const response = await client.assistants.search(request as any);
    return response as Assistant[];
  } catch (error) {
    console.error("Failed to search assistants:", error);
    return [];
  }
}

export async function getAssistantSchemas(
  apiUrl: string,
  assistantId: string,
  apiKey?: string
): Promise<AssistantSchemas | null> {
  if (!assistantId) {
    console.warn("Assistant ID is missing, skipping schemas API call");
    return null;
  }

  try {
    const client = createClient(apiUrl, apiKey);
    const schemas = await client.assistants.getSchemas(assistantId);
    return schemas as AssistantSchemas;
  } catch (error) {
    console.error(`Failed to fetch assistant schemas for "${assistantId}":`, error);
    return null;
  }
}

export async function updateAssistantConfig(
  apiUrl: string,
  assistantId: string,
  config: AssistantConfig,
  apiKey?: string
): Promise<Assistant | null> {
  if (!assistantId) {
    console.error("Cannot update assistant config: assistant ID is missing");
    return null;
  }

  try {
    const client = createClient(apiUrl, apiKey);
    const assistant = await client.assistants.update(assistantId, {
      config,
    });
    return assistant as Assistant;
  } catch (error) {
    console.error(`Failed to update assistant config for "${assistantId}":`, error);
    return null;
  }
}
