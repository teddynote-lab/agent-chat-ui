import React, {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useQueryState } from "nuqs";
import { getApiKey } from "@/lib/api-key";
import { useThreads } from "@/hooks/useThreads";
import { toast } from "sonner";
import { AssistantConfigProvider } from "./AssistantConfig";
import { normalizeApiUrl } from "./client";
import { TIMING } from "@/lib/constants";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
      context?: Record<string, unknown>;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

export type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = TIMING.THREAD_FETCH_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
): Promise<boolean> {
  console.log("[checkGraphStatus] Checking connection to:", apiUrl);
  console.log("[checkGraphStatus] API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "none");

  if (!apiUrl || apiUrl.trim() === "") {
    console.error("[checkGraphStatus] ❌ API URL is empty");
    return false;
  }

  try {
    const url = `${apiUrl}/info`;
    console.log("[checkGraphStatus] Fetching:", url);

    const res = await fetch(url, {
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });

    console.log("[checkGraphStatus] Response status:", res.status, res.statusText);
    const isOk = res.ok;
    console.log(`[checkGraphStatus] ${isOk ? "✅" : "❌"} Connection ${isOk ? "successful" : "failed"}`);
    return isOk;
  } catch (e) {
    console.error("[checkGraphStatus] ❌ Error:", e);
    return false;
  }
}

const StreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
}: {
  children: ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const { getThreads, setThreads } = useThreads();

  // Memoize callbacks to prevent infinite re-renders
  const handleCustomEvent = useCallback(
    (event: unknown, options: { mutate: (fn: (prev: StateType) => StateType) => void }) => {
      if (isUIMessage(event) || isRemoveUIMessage(event)) {
        options.mutate((prev: StateType) => {
          const ui = uiMessageReducer(prev.ui ?? [], event);
          return { ...prev, ui };
        });
      }
    },
    []
  );

  const handleThreadId = useCallback(
    (id: string) => {
      setThreadId(id);
      // Refetch threads list when thread ID changes.
      // Wait for some seconds before fetching so we're able to get the new thread that was created.
      sleep().then(() => getThreads().then(setThreads).catch(console.error));
    },
    [setThreadId, getThreads, setThreads]
  );

  const streamValue = useTypedStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    assistantId,
    threadId: threadId ?? null,
    fetchStateHistory: true,
    onCustomEvent: handleCustomEvent,
    onThreadId: handleThreadId,
  });

  useEffect(() => {
    checkGraphStatus(apiUrl, apiKey).then((ok) => {
      if (!ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: () => (
            <p>
              Please ensure your graph is running at <code>{apiUrl}</code> and
              your API key is correctly set (if connecting to a deployed graph).
            </p>
          ),
          duration: 10000,
          richColors: true,
          closeButton: true,
        });
      }
    });
  }, [apiKey, apiUrl]);

  return (
    <StreamContext.Provider value={streamValue}>
      <AssistantConfigProvider
        apiUrl={apiUrl}
        assistantId={assistantId}
        apiKey={apiKey}
      >
        {children}
      </AssistantConfigProvider>
    </StreamContext.Provider>
  );
};

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Get environment variables
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const envAssistantId: string | undefined = process.env.NEXT_PUBLIC_ASSISTANT_ID;
  const envApiKey: string | undefined = process.env.NEXT_PUBLIC_LANGCHAIN_API_KEY;

  // Use URL params with env var fallbacks
  const [apiUrl, _setApiUrl] = useQueryState("apiUrl", {
    defaultValue: envApiUrl || "",
  });
  const [assistantId, _setAssistantId] = useQueryState("assistantId", {
    defaultValue: envAssistantId || "",
  });

  // For API key, use localStorage with env var fallback
  const [apiKey, _setApiKey] = useState(() => {
    const storedKey = getApiKey();
    // If no stored key but env var exists, use and save the env var
    if (!storedKey && envApiKey && typeof window !== "undefined") {
      window.localStorage.setItem("lg:chat:apiKey", envApiKey);
      return envApiKey;
    }
    return storedKey || envApiKey || "";
  });

  const _setApiKeyWrapper = (key: string) => {
    window.localStorage.setItem("lg:chat:apiKey", key);
    _setApiKey(key);
  };

  // Determine final values to use, prioritizing URL params then env vars
  const finalApiUrl = apiUrl || envApiUrl;
  const finalAssistantId = assistantId?.trim() || envAssistantId || "";
  const resolvedApiUrl = useMemo(
    () => normalizeApiUrl(finalApiUrl),
    [finalApiUrl]
  );

  // Log connection parameters
  console.log("[StreamProvider] Connection parameters:", {
    apiUrl,
    envApiUrl,
    finalApiUrl,
    resolvedApiUrl,
    assistantId,
    envAssistantId,
    finalAssistantId,
    apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : "none",
  });

  return (
    <StreamSession
      apiKey={apiKey}
      apiUrl={resolvedApiUrl}
      assistantId={finalAssistantId}
    >
      {children}
    </StreamSession>
  );
};

export default StreamContext;
