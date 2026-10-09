import { useState, type ReactNode } from "react";
import type { RouteKey } from "../../types/models";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout({
  route,
  navigate,
  children,
}: {
  route: RouteKey;
  navigate: (route: RouteKey) => void;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#f2f6fa] text-navy font-sans selection:bg-brass/25 selection:text-navy">
      <Sidebar
        active={route}
        navigate={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="lg:pl-64 flex min-h-[100dvh] flex-col">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
