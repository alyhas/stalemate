import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type LayoutSection = "side" | "main" | "tray";

interface LayoutContextValue {
  layoutOrder: LayoutSection[];
  setLayoutOrder: (order: LayoutSection[]) => void;
}

const DEFAULT_ORDER: LayoutSection[] = ["side", "main", "tray"];

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutOrder, setLayoutOrder] = useState<LayoutSection[]>(() => {
    const stored = localStorage.getItem("layoutOrder");
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        if (
          Array.isArray(arr) &&
          arr.every((s) => s === "side" || s === "main" || s === "tray")
        ) {
          return arr as LayoutSection[];
        }
      } catch (_) {
        // ignore
      }
    }
    return DEFAULT_ORDER;
  });

  useEffect(() => {
    localStorage.setItem("layoutOrder", JSON.stringify(layoutOrder));
  }, [layoutOrder]);

  return (
    <LayoutContext.Provider value={{ layoutOrder, setLayoutOrder }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
