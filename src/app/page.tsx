import { loadServerConfig } from "@/lib/config-server";

import ClientApp from "./ClientApp";

export default async function DemoPage() {
  const initialConfig = await loadServerConfig();

  return <ClientApp initialConfig={initialConfig} />;
}
