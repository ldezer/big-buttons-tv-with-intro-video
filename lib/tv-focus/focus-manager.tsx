import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DeviceEventEmitter, Platform, StyleSheet, View } from 'react-native';

// Android KeyEvent keycodes we care about. Values match android.view.KeyEvent.
export const TV_KEY = {
  DPAD_UP: 19,
  DPAD_DOWN: 20,
  DPAD_LEFT: 21,
  DPAD_RIGHT: 22,
  DPAD_CENTER: 23,
  ENTER: 66,
  MENU: 82,
  // Android TV remotes sometimes send this for the menu / "three lines" key
  MEDIA_MENU: 305,
};

export type FocusRect = { x: number; y: number; w: number; h: number };

type Entry = {
  id: string;
  rect: FocusRect | null;
  preferred: boolean;
  onSelect: () => void;
  setLocalFocused: (v: boolean) => void;
};

type Listener = (keyCode: number) => void;

type FocusContextValue = {
  focusedId: string | null;
  registerEntry: (entry: Entry) => () => void;
  reportRect: (id: string, rect: FocusRect) => void;
  requestFocus: (id: string) => void;
  subscribeKey: (listener: Listener) => () => void;
};

const FocusContext = createContext<FocusContextValue | null>(null);

export function useFocusManager() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('FocusProvider missing. Wrap your app in <FocusProvider>.');
  return ctx;
}

function centerOf(r: FocusRect) {
  return { cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
}

/**
 * Spatial navigation: from `fromRect`, pick the best entry in `dir`.
 * Heuristic: primary-axis distance + 2x perpendicular distance penalty so
 * DPAD_DOWN prefers the closest item below in roughly the same column.
 */
function pickNext(
  fromId: string,
  fromRect: FocusRect,
  entries: Entry[],
  dir: 'up' | 'down' | 'left' | 'right'
): string | null {
  const { cx, cy } = centerOf(fromRect);
  let best: { id: string; score: number } | null = null;

  for (const e of entries) {
    if (e.id === fromId || !e.rect) continue;
    const { cx: ex, cy: ey } = centerOf(e.rect);
    const dx = ex - cx;
    const dy = ey - cy;

    let primary: number;
    let perpendicular: number;

    if (dir === 'up') {
      if (dy >= -1) continue;
      primary = -dy;
      perpendicular = Math.abs(dx);
    } else if (dir === 'down') {
      if (dy <= 1) continue;
      primary = dy;
      perpendicular = Math.abs(dx);
    } else if (dir === 'left') {
      if (dx >= -1) continue;
      primary = -dx;
      perpendicular = Math.abs(dy);
    } else {
      if (dx <= 1) continue;
      primary = dx;
      perpendicular = Math.abs(dy);
    }

    const score = primary + perpendicular * 2;
    if (!best || score < best.score) {
      best = { id: e.id, score };
    }
  }
  return best ? best.id : null;
}

export function FocusProvider({ children }: { children: React.ReactNode }) {
  // Entries kept in a ref so registration/measure does not cause re-renders.
  const entriesRef = useRef<Map<string, Entry>>(new Map());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [focusRect, setFocusRect] = useState<FocusRect | null>(null);
  const focusedIdRef = useRef<string | null>(null);
  focusedIdRef.current = focusedId;
  const listenersRef = useRef<Set<Listener>>(new Set());

  const setFocus = useCallback((nextId: string | null) => {
    setFocusedId((prev) => {
      if (prev === nextId) return prev;
      const prevEntry = prev ? entriesRef.current.get(prev) : null;
      prevEntry?.setLocalFocused(false);
      const nextEntry = nextId ? entriesRef.current.get(nextId) : null;
      nextEntry?.setLocalFocused(true);
      setFocusRect(nextEntry?.rect ?? null);
      return nextId;
    });
  }, []);

  /**
   * Auto-claim focus when we have no focused element and at least one entry
   * is mounted with a known rect. Prefers `preferred` entries. Runs after
   * registers and rect reports.
   */
  const maybeClaimInitialFocus = useCallback(() => {
    if (focusedIdRef.current) return;
    const all = Array.from(entriesRef.current.values()).filter((e) => e.rect);
    if (all.length === 0) return;
    const preferred = all.find((e) => e.preferred);
    const target = preferred ?? all[0];
    setFocus(target.id);
  }, [setFocus]);

  const registerEntry = useCallback((entry: Entry) => {
    entriesRef.current.set(entry.id, entry);
    // If rect was already supplied at register time, try claiming focus.
    if (entry.rect) {
      // defer so the registering component finishes its render first
      setTimeout(maybeClaimInitialFocus, 0);
    }
    return () => {
      const wasFocused = focusedIdRef.current === entry.id;
      entriesRef.current.delete(entry.id);
      if (wasFocused) {
        setFocus(null);
        // Try to claim focus on the next available entry (covers screen change)
        setTimeout(maybeClaimInitialFocus, 0);
      }
    };
  }, [maybeClaimInitialFocus, setFocus]);

  const reportRect = useCallback((id: string, rect: FocusRect) => {
    const entry = entriesRef.current.get(id);
    if (!entry) return;
    entry.rect = rect;
    if (focusedIdRef.current === id) {
      setFocusRect(rect);
    }
    if (!focusedIdRef.current) {
      maybeClaimInitialFocus();
    }
  }, [maybeClaimInitialFocus]);

  const requestFocus = useCallback((id: string) => {
    const entry = entriesRef.current.get(id);
    if (entry) setFocus(id);
  }, [setFocus]);

  const subscribeKey = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Route an incoming hardware key event.
  const handleKey = useCallback((keyCode: number) => {
    // Notify per-screen subscribers first (e.g. MENU -> save handlers).
    for (const l of Array.from(listenersRef.current)) {
      try {
        l(keyCode);
      } catch {
        // ignore
      }
    }

    if (keyCode === TV_KEY.DPAD_CENTER || keyCode === TV_KEY.ENTER) {
      const id = focusedIdRef.current;
      if (id) {
        const e = entriesRef.current.get(id);
        e?.onSelect();
      }
      return;
    }

    let dir: 'up' | 'down' | 'left' | 'right' | null = null;
    if (keyCode === TV_KEY.DPAD_UP) dir = 'up';
    else if (keyCode === TV_KEY.DPAD_DOWN) dir = 'down';
    else if (keyCode === TV_KEY.DPAD_LEFT) dir = 'left';
    else if (keyCode === TV_KEY.DPAD_RIGHT) dir = 'right';
    if (!dir) return;

    const entries = Array.from(entriesRef.current.values()).filter((e) => e.rect);
    if (entries.length === 0) return;

    const currentId = focusedIdRef.current;
    const currentRect = currentId ? entriesRef.current.get(currentId)?.rect ?? null : null;

    if (!currentId || !currentRect) {
      setFocus(entries[0].id);
      return;
    }

    const nextId = pickNext(currentId, currentRect, entries, dir);
    if (nextId) setFocus(nextId);
    // No next found: user is at the edge in that direction. Stay put.
  }, [setFocus]);

  // Subscribe to native key events. Also wire a web/keyboard fallback so the
  // same system works in Expo web previews and on Chromebooks.
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('BigButtonsTVKey', (payload: { keyCode: number }) => {
      if (payload && typeof payload.keyCode === 'number') {
        handleKey(payload.keyCode);
      }
    });

    let webKeyHandler: ((e: KeyboardEvent) => void) | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const map: Record<string, number> = {
        ArrowUp: TV_KEY.DPAD_UP,
        ArrowDown: TV_KEY.DPAD_DOWN,
        ArrowLeft: TV_KEY.DPAD_LEFT,
        ArrowRight: TV_KEY.DPAD_RIGHT,
        Enter: TV_KEY.ENTER,
        ' ': TV_KEY.DPAD_CENTER,
        m: TV_KEY.MENU,
        M: TV_KEY.MENU,
      };
      webKeyHandler = (e: KeyboardEvent) => {
        const code = map[e.key];
        if (code === undefined) return;
        // Don't fight form fields with arrows / enter.
        const tag = (e.target as HTMLElement | null)?.tagName;
        if ((tag === 'INPUT' || tag === 'TEXTAREA') && code !== TV_KEY.MENU) return;
        handleKey(code);
        if (code === TV_KEY.DPAD_CENTER || code === TV_KEY.ENTER) {
          e.preventDefault();
        }
      };
      window.addEventListener('keydown', webKeyHandler);
    }

    return () => {
      sub.remove();
      if (webKeyHandler && typeof window !== 'undefined') {
        window.removeEventListener('keydown', webKeyHandler);
      }
    };
  }, [handleKey]);

  const value = useMemo<FocusContextValue>(() => ({
    focusedId,
    registerEntry,
    reportRect,
    requestFocus,
    subscribeKey,
  }), [focusedId, registerEntry, reportRect, requestFocus, subscribeKey]);

  return (
    <FocusContext.Provider value={value}>
      {children}
      {focusRect ? (
        <View pointerEvents="none" style={[styles.globalRing, {
          top: focusRect.y - 8,
          left: focusRect.x - 8,
          width: focusRect.w + 16,
          height: focusRect.h + 16,
        }]} />
      ) : null}
    </FocusContext.Provider>
  );
}

const styles = StyleSheet.create({
  globalRing: {
    position: 'absolute',
    borderWidth: 6,
    borderColor: '#FFD600',
    borderRadius: 18,
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 14,
    elevation: 30,
    zIndex: 99999,
  },
});

/**
 * Used by TVPressable. Generates a stable id, registers with the manager,
 * exposes onLayout (call from the element) to report screen rect, and
 * returns the current focus state. onSelect is invoked when the user presses
 * the D-pad CENTER / ENTER key while this element is focused.
 */
export function useFocusable(opts: {
  id?: string;
  preferred?: boolean;
  onSelect?: () => void;
}) {
  const manager = useFocusManager();
  const idRef = useRef<string>(opts.id ?? `f_${Math.random().toString(36).slice(2, 10)}`);
  const id = idRef.current;
  const viewRef = useRef<View | null>(null);
  const [focused, setFocused] = useState(false);

  // Keep onSelect up to date without re-registering on every render.
  const onSelectRef = useRef<(() => void) | undefined>(opts.onSelect);
  onSelectRef.current = opts.onSelect;

  // Register once on mount. `preferred` is snapshotted at register time -
  // if it changes later, callers can call requestFocus explicitly.
  const preferredAtMountRef = useRef(!!opts.preferred);

  useEffect(() => {
    const unregister = manager.registerEntry({
      id,
      rect: null,
      preferred: preferredAtMountRef.current,
      onSelect: () => onSelectRef.current?.(),
      setLocalFocused: setFocused,
    });
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onLayout = useCallback(() => {
    const node = viewRef.current as unknown as {
      measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void;
    } | null;
    if (!node || typeof node.measureInWindow !== 'function') return;
    node.measureInWindow((x, y, w, h) => {
      if (typeof x === 'number' && typeof y === 'number' && w > 0 && h > 0) {
        manager.reportRect(id, { x, y, w, h });
      }
    });
  }, [id, manager]);

  const requestFocus = useCallback(() => manager.requestFocus(id), [id, manager]);

  return { id, focused, viewRef, onLayout, requestFocus };
}

/**
 * Subscribe to any TV hardware key. Handler is called with the keyCode.
 * Handler ref is kept fresh between renders without re-subscribing.
 */
export function useTVHardwareKey(handler: (keyCode: number) => void) {
  const manager = useFocusManager();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const unsub = manager.subscribeKey((keyCode) => handlerRef.current(keyCode));
    return unsub;
  }, [manager]);
}

/**
 * Convenience: call handler when the user presses the MENU button on an
 * Android TV / Fire TV remote (the "three lines" button). Used on edit
 * screens to bind MENU -> save.
 */
export function useMenuKey(handler: () => void, enabled: boolean = true) {
  useTVHardwareKey((keyCode) => {
    if (!enabled) return;
    if (keyCode === TV_KEY.MENU || keyCode === TV_KEY.MEDIA_MENU) {
      handler();
    }
  });
}
