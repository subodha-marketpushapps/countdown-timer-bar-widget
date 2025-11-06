import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";

const MAX_HISTORY_LENGTH = 50;

export const useHistoryState = <T>(
  state: T,
  setState: (newState: T) => void
) => {
  const [history, setHistory] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const isUndoRedoRef = useRef(false);

  const updateHistory = useCallback(
    debounce((newState: T) => {
      setHistory((prev) => {
        const lastState = prev[prev.length - 1];
        if (lastState && isEqual(lastState, newState)) return prev;
        const updated = [...prev, newState];
        if (updated.length > MAX_HISTORY_LENGTH) updated.shift();
        return updated;
      });
      setFuture([]);
    }, 500),
    []
  );

  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    updateHistory(state);
  }, [state, updateHistory]);

  const undo = useCallback(() => {
    if (history.length <= 1) return;
    isUndoRedoRef.current = true;
    const previousState = history[history.length - 2];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [state, ...prev]);
    setState(previousState);
  }, [history, state, setState]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    isUndoRedoRef.current = true;
    const nextState = future[0];
    setHistory((prev) => [...prev, state]);
    setFuture((prev) => prev.slice(1));
    setState(nextState);
  }, [future, state, setState]);

  const clear = useCallback(() => {
    setHistory([]);
    setFuture([]);
  }, []);

  return {
    undo,
    redo,
    canUndo: history.length > 1,
    canRedo: future.length > 0,
    clear,
    canClear: history.length > 0 || future.length > 0,
  };
};
