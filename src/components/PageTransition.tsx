import { useEffect, type ReactNode } from "react";

interface PageTransitionProps {
  route: string;
  children: ReactNode;
}

export function PageTransition({ route, children }: PageTransitionProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <div key={route} className="page-enter">
      {children}
    </div>
  );
}