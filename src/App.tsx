import { useEffect } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
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

    // 2. Chặn các phím tắt duyệt web (chỉ kích hoạt trên production để tránh vô tình mất bài thi)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cho phép F5 và Ctrl+R khi đang ở môi trường dev để cập nhật code mượt mà
      if (import.meta.env.DEV) return;

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

  return (
    <Theme theme={neutralTheme} mode="light">
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Theme>
  );
}

