"use client";

import { useEffect, useState } from "react";
import { ROUTES, routeFromHash } from "../constants/routes";
import type { RouteKey } from "../types/models";

export function useHashRoute() {
  const [route, setRoute] = useState<RouteKey>("landing");
  useEffect(() => {
    const sync = () => setRoute(routeFromHash(window.location.hash));
    if (!window.location.hash) window.location.hash = ROUTES.landing;
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const navigate = (next: RouteKey) => { window.location.hash = ROUTES[next]; };
  return { route, navigate };
}
