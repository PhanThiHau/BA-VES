import { useState, type ReactNode } from "react";
import type { RouteKey } from "../../types/models";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout({ route, navigate, children }: { route: RouteKey; navigate: (route: RouteKey) => void; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="noise-wash min-h-[100dvh] text-[#1c314d]"><Sidebar active={route} navigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} /><div className="lg:pl-60"><Header onMenu={() => setMenuOpen(true)} /><main className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 lg:px-7 lg:py-6">{children}</main></div></div>;
}
