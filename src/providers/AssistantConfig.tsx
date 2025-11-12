import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  getAssistant,
  searchAssistants,
  getAssistantSchemas,
  updateAssistantConfig,
  type AssistantConfig as AssistantConfigType,
  type AssistantSchemas,
  type Assistant,
} from "@/lib/assistant-api";

interface AssistantConfigContextType {
  config: AssistantConfigType | null;
  schemas: AssistantSchemas | null;
  assistantId: string | null;
  isLoading: boolean;
  error: string | null;
  updateConfig: (newConfig: AssistantConfigType) => Promise<boolean>;
  refetchConfig: () => Promise<void>;
  assistants: Assistant[];
  assistantsLoading: boolean;
  refetchAssistants: () => Promise<void>;
}

const AssistantConfigContext = createContext<
  AssistantConfigContextType | undefined
>(undefined);

export const AssistantConfigProvider: React.FC<{
  children: ReactNode;
  apiUrl: string;
  assistantId: string;
  apiKey: string | null;
}> = ({ children, apiUrl, assistantId: initialAssistantId, apiKey }) => {
  const [config, setConfig] = useState<AssistantConfigType | null>(null);
  const [schemas, setSchemas] = useState<AssistantSchemas | null>(null);
  // Always start with no assistant selected; fetchConfig will populate it once resolved.
  const [assistantId, setAssistantId] = useState<string | null>(() => null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [assistantsLoading, setAssistantsLoading] = useState(false);

  const fetchAssistants = useCallback(async () => {
    if (!apiUrl) {
      return;
    }

    setAssistantsLoading(true);
    try {
      const list = await searchAssistants(
        apiUrl,
        {
          limit: 50,
          sort_order: "asc",
          sort_by: "assistant_id",
          select: ["assistant_id", "graph_id", "name"],
        },
        apiKey || undefined
      );
      setAssistants(list);
    } finally {
      setAssistantsLoading(false);
    }
  }, [apiUrl, apiKey]);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let actualAssistantId = initialAssistantId;
      let assistant = await getAssistant(
        apiUrl,
        actualAssistantId,
        apiKey || undefined
      );

      if (!assistant) {
        console.info(
          `Assistant "${initialAssistantId}" not found directly, searching by graph_id`
        );
        const assistants = await searchAssistants(
          apiUrl,
          {
            graph_id: initialAssistantId,
            limit: 1,
            sort_order: "asc",
            sort_by: "assistant_id",
            select: ["assistant_id"], // Only fetch assistant_id
          },
          apiKey || undefined
        );

        if (assistants.length > 0) {
          actualAssistantId = assistants[0].assistant_id;
          console.info(
            `Resolved graph_id "${initialAssistantId}" to assistant ID: ${actualAssistantId}`
          );
          assistant = await getAssistant(
            apiUrl,
            actualAssistantId,
            apiKey || undefined
          );
        } else {
          const message = `No assistant found for graph_id: ${initialAssistantId}`;
          console.warn(message);
          setError(message);
          setConfig(null);
          setSchemas(null);
          setAssistantId(null);
          return;
        }
      }

      if (!assistant) {
        const message = `Failed to load assistant configuration for ID: ${actualAssistantId}`;
        console.error(message);
        setError(message);
        setConfig(null);
        setSchemas(null);
        setAssistantId(null);
        return;
      }

      setAssistantId(actualAssistantId);
      setConfig(assistant.config);

      const assistantSchemas = await getAssistantSchemas(
        apiUrl,
        actualAssistantId,
        apiKey || undefined
      );

      setSchemas(assistantSchemas);
    } catch (err) {
      console.error("Error fetching assistant config:", err);
      setError("Unable to load assistant configuration");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, initialAssistantId, apiKey]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  const updateConfig = useCallback(async (
    newConfig: AssistantConfigType
  ): Promise<boolean> => {
    if (!assistantId) {
      console.error("No assistant ID available for update");
      return false;
    }

    try {
      const assistant = await updateAssistantConfig(
        apiUrl,
        assistantId,
        newConfig,
        apiKey || undefined
      );
      if (assistant) {
        setConfig(assistant.config);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update config:", err);
      return false;
    }
  }, [apiUrl, assistantId, apiKey]);

  const contextValue = useMemo(
    () => ({
      config,
      schemas,
      assistantId,
      isLoading,
      error,
      updateConfig,
      refetchConfig: fetchConfig,
      assistants,
      assistantsLoading,
      refetchAssistants: fetchAssistants,
    }),
    [
      config,
      schemas,
      assistantId,
      isLoading,
      error,
      updateConfig,
      fetchConfig,
      assistants,
      assistantsLoading,
      fetchAssistants,
    ]
  );

  return (
    <AssistantConfigContext.Provider value={contextValue}>
      {children}
    </AssistantConfigContext.Provider>
  );
};

export const useAssistantConfig = (): AssistantConfigContextType => {
  const context = useContext(AssistantConfigContext);
  if (context === undefined) {
    throw new Error(
      "useAssistantConfig must be used within an AssistantConfigProvider"
    );
  }
  return context;
};
