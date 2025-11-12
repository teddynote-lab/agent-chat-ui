import { useContext } from "react";
import { AssistantConfigContext, type AssistantConfigContextType } from "@/providers/AssistantConfig";

export const useAssistantConfig = (): AssistantConfigContextType => {
  const context = useContext(AssistantConfigContext);
  if (context === undefined) {
    throw new Error(
      "useAssistantConfig must be used within an AssistantConfigProvider"
    );
  }
  return context;
};
