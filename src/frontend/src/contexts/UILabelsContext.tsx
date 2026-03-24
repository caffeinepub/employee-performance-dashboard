import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DEFAULT_UI_LABELS, type UILabels } from "../data/uiLabels";
import { useActor } from "../hooks/useActor";

const STORAGE_KEY = "ui_labels_v1";
const KV_KEY = "ui_labels";

function loadLabelsFromStorage(): UILabels {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_UI_LABELS };
    return { ...DEFAULT_UI_LABELS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_UI_LABELS };
  }
}

function saveLabelsToStorage(labels: UILabels) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
  } catch {}
}

// Candid optional: [] means null, [value] means Some(value)
function unwrapOptional<T>(val: [] | [T] | T | null | undefined): T | null {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return val.length > 0 ? (val[0] as T) : null;
  return val as T;
}

interface UILabelsContextType {
  labels: UILabels;
  setLabel: (key: keyof UILabels, value: string) => void;
  saveAll: (newLabels: UILabels) => Promise<void>;
  resetAll: () => Promise<void>;
  isSyncing: boolean;
}

const UILabelsContext = createContext<UILabelsContextType | null>(null);

export function UILabelsProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor();
  const [labels, setLabelsState] = useState<UILabels>(loadLabelsFromStorage);
  const [isSyncing, setIsSyncing] = useState(false);
  const loadedFromBackend = useRef(false);

  // Load from backend KV store whenever actor becomes available
  // Retry with polling if actor is not ready yet
  useEffect(() => {
    if (!actor || loadedFromBackend.current) return;
    let cancelled = false;
    (async () => {
      try {
        setIsSyncing(true);
        const raw = await (actor as any).getKV(KV_KEY);
        if (cancelled) return;
        const val = unwrapOptional<string>(raw);
        if (val) {
          const parsed = { ...DEFAULT_UI_LABELS, ...JSON.parse(val) };
          setLabelsState(parsed);
          saveLabelsToStorage(parsed);
        }
        loadedFromBackend.current = true;
      } catch (e) {
        console.warn(
          "[UILabels] Could not load from backend KV, using localStorage",
          e,
        );
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actor]);

  const setLabel = useCallback((key: keyof UILabels, value: string) => {
    setLabelsState((prev) => {
      const next = { ...prev, [key]: value };
      saveLabelsToStorage(next);
      return next;
    });
  }, []);

  const saveAll = useCallback(
    async (newLabels: UILabels) => {
      saveLabelsToStorage(newLabels);
      setLabelsState(newLabels);
      if (actor) {
        try {
          await (actor as any).setKV(KV_KEY, JSON.stringify(newLabels));
          // Clear localStorage after successful backend save so all devices
          // always load the authoritative copy from backend
          localStorage.removeItem(STORAGE_KEY);
          loadedFromBackend.current = true;
        } catch (e) {
          console.warn(
            "[UILabels] Could not save to backend KV, saved to localStorage only",
            e,
          );
        }
      }
    },
    [actor],
  );

  const resetAll = useCallback(async () => {
    const defaults = { ...DEFAULT_UI_LABELS };
    localStorage.removeItem(STORAGE_KEY);
    setLabelsState(defaults);
    loadedFromBackend.current = false;
    if (actor) {
      try {
        await (actor as any).deleteKV(KV_KEY);
      } catch (e) {
        console.warn("[UILabels] Could not delete backend KV key", e);
      }
    }
  }, [actor]);

  return (
    <UILabelsContext.Provider
      value={{ labels, setLabel, saveAll, resetAll, isSyncing }}
    >
      {children}
    </UILabelsContext.Provider>
  );
}

export function useLabels() {
  const ctx = useContext(UILabelsContext);
  if (!ctx) throw new Error("useLabels must be used within UILabelsProvider");
  return ctx;
}
