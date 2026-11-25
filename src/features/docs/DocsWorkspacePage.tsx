import { TipTapEditor } from "./TipTapEditor";
import type { RouteKey } from "../../types/models";

/**
 * DocsWorkspacePage: Dedicated Document Editor Workspace powered by TipTap.
 * Docs workspace loads DEL templates from API with draft auto-saving and evaluation submission.
 */
export function DocsWorkspacePage({ navigate }: { navigate: (route: RouteKey) => void }) {
  return <TipTapEditor navigate={navigate} />;
}

