import { Skeleton } from "@/components/ui/skeleton";
import { ThreadListContainer } from "./ThreadListContainer";
import { SKELETON_LOADING_COUNT } from "../constants";

export function ThreadHistoryLoading() {
  return (
    <ThreadListContainer>
      {Array.from({ length: SKELETON_LOADING_COUNT }).map((_, i) => (
        <Skeleton key={`skeleton-${i}`} className="w-full h-10" />
      ))}
    </ThreadListContainer>
  );
}
