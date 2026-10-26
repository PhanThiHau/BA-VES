import { useEffect } from "react";
import { AppProvider } from "./contexts/AppContext";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  useEffect(() => {
    // 1. Chặn context menu chuột phải của trình duyệt
    const handleContextMenu = (e: MouseEvent) => {
      // Cho phép chuột phải trong thẻ input/textarea để thao tác copy/paste
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
    };

    // 2. Chặn các phím tắt duyệt web (F5, Ctrl+R, Ctrl+S, Ctrl+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "F5") {
        e.preventDefault();
      }
      if (cmdOrCtrl && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
      }
      if (cmdOrCtrl && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
      }
      if (cmdOrCtrl && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <AppProvider><AppRoutes /></AppProvider>;
}

