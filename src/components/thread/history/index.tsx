"use client";

import { useThreads } from "@/hooks/useThreads";
import { useSettings } from "@/hooks/useSettings";
import { useEffect } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { MobileSidebar } from "./components/MobileSidebar";

interface ThreadHistoryProps {
  onShowGuide?: () => void;
}

export default function ThreadHistory({ onShowGuide }: ThreadHistoryProps) {
  const { config } = useSettings();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(config.threads.sidebarOpenByDefault),
  );
  const [_threadId, setThreadId] = useQueryState("threadId");
  const [apiUrl] = useQueryState("apiUrl");
  const [assistantId] = useQueryState("assistantId");
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const finalApiUrl = apiUrl || envApiUrl;
  const finalAssistantId = assistantId?.trim();

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  // Load threads when apiUrl and assistantId are available
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!finalApiUrl || !finalAssistantId) return;

    setThreadsLoading(true);
    getThreads()
      .then(setThreads)
      .catch((error) => {
        console.error(error);
        setThreads([]); // Set empty array on error to show clean empty state
      })
      .finally(() => setThreadsLoading(false));
  }, [
    finalApiUrl,
    finalAssistantId,
    getThreads,
    setThreads,
    setThreadsLoading,
  ]);

  const handleNewChat = () => {
    setThreadId(null);
  };

  const handleToggleChatHistory = () => {
    setChatHistoryOpen((p) => !p);
  };

  const handleMobileNewChat = () => {
    handleNewChat();
    setChatHistoryOpen(false);
  };

  const handleMobileThreadClick = () => {
    setChatHistoryOpen((o) => !o);
  };

  return (
    <>
      <DesktopSidebar
        threads={threads}
        threadsLoading={threadsLoading}
        chatHistoryOpen={chatHistoryOpen}
        onToggleChatHistory={handleToggleChatHistory}
        onNewChat={handleNewChat}
        onShowGuide={onShowGuide}
      />
      <MobileSidebar
        threads={threads}
        isOpen={!!chatHistoryOpen && !isLargeScreen}
        onOpenChange={(open) => {
          if (isLargeScreen) return;
          setChatHistoryOpen(open);
        }}
        onNewChat={handleMobileNewChat}
        onThreadClick={handleMobileThreadClick}
        onShowGuide={onShowGuide}
      />
    </>
  );
}
