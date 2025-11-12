import { useContext } from "react";
import StreamContext, { type StreamContextType } from "@/providers/Stream";

export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};
