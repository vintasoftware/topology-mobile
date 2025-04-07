import { BaseClient } from "@TopologyHealth/smarterfhir";
import { createContext } from "react";

export const SmarterFhirContext = createContext<{
  client: BaseClient | null;
  setClient: (client: BaseClient) => void;
  logout: () => void;
}>({
  client: null,
  setClient: () => {},
  logout: () => {},
});