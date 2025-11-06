import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for debounced input handling
 * Prevents cursor jumping by maintaining local state and debouncing updates
 */
export const useDebouncedInput = (
  initialValue: string,
  onDebouncedChange: (value: string) => void,
  delay: number = 100
) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isUserInput, setIsUserInput] = useState(false); // Track if change is from user
  
  // Use ref to always have the latest callback without causing re-renders
  const onDebouncedChangeRef = useRef(onDebouncedChange);

  // Update the ref when callback changes
  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  // Update local state when external value changes (e.g., from props)
  useEffect(() => {
    setLocalValue(initialValue);
    setDebouncedValue(initialValue);
    setIsUserInput(false); // Reset user input flag when props change
  }, [initialValue]);

  // Debounce the value changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(localValue);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [localValue, delay]);

  // Call the onChange callback ONLY when debounced value changes from USER INPUT
  useEffect(() => {
    if (isUserInput && debouncedValue !== initialValue) {
      onDebouncedChangeRef.current(debouncedValue);
      setIsUserInput(false); // Reset flag after triggering callback
    }
  }, [debouncedValue, initialValue, isUserInput]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    setIsUserInput(true); // Mark this as user input
  }, []);

  return {
    value: localValue,
    onChange: handleChange,
  };
};
