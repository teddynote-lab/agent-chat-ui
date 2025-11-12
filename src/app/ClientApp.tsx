"use client";

import React from "react";

import { Thread } from "@/components/thread";
import { ArtifactProvider } from "@/components/thread/artifact";
import { Toaster } from "@/components/ui/sonner";
import { ChatConfig } from "@/lib/config";
import { SettingsProvider } from "@/providers/Settings";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";

interface ClientAppProps {
  initialConfig: ChatConfig;
}

export default function ClientApp({ initialConfig }: ClientAppProps) {
  return (
    <React.Suspense fallback={<div></div>}>
      <Toaster />
      <SettingsProvider initialConfig={initialConfig}>
        <ThreadProvider>
          <StreamProvider>
            <ArtifactProvider>
              <Thread />
            </ArtifactProvider>
          </StreamProvider>
        </ThreadProvider>
      </SettingsProvider>
    </React.Suspense>
  );
}
