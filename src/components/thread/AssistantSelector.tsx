import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assistant } from "@/lib/assistant-api";

interface AssistantSelectorProps {
  assistants: Assistant[];
  selectedAssistantId?: string;
  isLoading: boolean;
  onSelect: (assistantId: string) => void;
  onRefresh: () => void;
}

function formatAssistantLabel(assistant?: Assistant | null) {
  if (!assistant) {
    return "";
  }
  if (assistant.name && assistant.graph_id) {
    return `${assistant.name}`;
  }
  return assistant.name || assistant.graph_id || assistant.assistant_id;
}

export function AssistantSelector({
  assistants,
  selectedAssistantId,
  isLoading,
  onSelect,
  onRefresh,
}: AssistantSelectorProps) {

  return (
    <div className="flex gap-1 border border-border bg-card  transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer pl-3 pr-1 rounded-lg">
      <select
        id="assistant-selector"
        value={selectedAssistantId ?? "none"}
        onChange={(e) => {
          const value = e.target.value;
          if (value === selectedAssistantId) {
            return;
          }
          onSelect(value);
        }}
        disabled={assistants.length === 0 || isLoading}
        className="w-full rounded-xl outline-none aria-selected:border-none border-none bg-transparent px-0 py-2 text-sm focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        <option value="none">
          {isLoading
            ? "그래프 목록을 불러오는 중..."
            : assistants.length === 0
            ? "그래프가 없습니다"
            : "그래프를 선택하세요"}
        </option>
        {assistants.map((assistant) => (
          <option
            key={assistant.assistant_id}
            value={assistant.assistant_id}
          >
            {formatAssistantLabel(assistant)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          className={cn("h-3.5 w-3.5", isLoading ? "animate-spin" : "")}
        />
      </button>
    </div>
  );
}
