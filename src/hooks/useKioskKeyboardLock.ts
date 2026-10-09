import { useEffect, useState } from "react";

interface UseKioskKeyboardLockOptions {
  balance: number;
  onNotify?: (message: string) => void;
}

/**
 * Custom hook to lock kiosk keyboard when balance is 0.
 * Can be unlocked/toggled by the admin shortcut: Ctrl + Shift + K.
 * Automatically unlocks when balance > 0.
 */
export function useKioskKeyboardLock({ balance, onNotify }: UseKioskKeyboardLockOptions) {
  const [isOverrideUnlocked, setIsOverrideUnlocked] = useState(false);

  // If balance becomes positive (>0), automatically clear the override and remain unlocked
  useEffect(() => {
    if (balance > 0) {
      setIsOverrideUnlocked(false);
    }
  }, [balance]);

  const isLocked = balance <= 0 && !isOverrideUnlocked;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Admin Override Shortcut: Ctrl + Shift + K (case-insensitive)
      const isUnlockCombo =
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "K" || e.key === "k" || e.code === "KeyK");

      if (isUnlockCombo) {
        e.preventDefault();
        e.stopPropagation();
        setIsOverrideUnlocked((prev) => {
          const nextState = !prev;
          onNotify?.(
            nextState
              ? "🔓 KEYBOARD UNLOCKED (Admin Mode: Ctrl+Shift+K)"
              : "🔒 KEYBOARD LOCKED (Zero Balance Mode)"
          );
          return nextState;
        });
        return;
      }

      // If balance is 0 and not unlocked by admin, block keyboard event
      if (balance <= 0 && !isOverrideUnlocked) {
        // Prevent default action for all keyboard events
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (balance <= 0 && !isOverrideUnlocked) {
        const isUnlockCombo =
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === "K" || e.key === "k" || e.code === "KeyK");
        if (!isUnlockCombo) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (balance <= 0 && !isOverrideUnlocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Use capture phase (true) to intercept keyboard events before any child component or input receives them
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("keypress", handleKeyPress, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("keypress", handleKeyPress, true);
    };
  }, [balance, isOverrideUnlocked, onNotify]);

  return {
    isLocked,
    isOverrideUnlocked,
    setIsOverrideUnlocked,
  };
}
