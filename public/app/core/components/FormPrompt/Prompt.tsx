import { useEffect, useRef } from 'react';
import { type Location, useBlocker } from 'react-router-dom-v5-compat';

interface PromptProps {
  when?: boolean;
  message: string | ((location: Location) => string | boolean);
  onBlocked?: (blocker: NavigationBlocker) => void;
}

export interface NavigationBlocker {
  proceed: () => void;
  reset: () => void;
}

export const Prompt = ({ message, onBlocked, when = true }: PromptProps) => {
  const handledLocationKey = useRef<string>();
  const blocker = useBlocker(({ nextLocation }) => {
    if (!when) {
      return false;
    }

    const result = typeof message === 'function' ? message(nextLocation) : message;
    return result === false || typeof result === 'string';
  });

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      handledLocationKey.current = undefined;
      return;
    }

    if (handledLocationKey.current === blocker.location.key) {
      return;
    }
    handledLocationKey.current = blocker.location.key;

    if (typeof message === 'string') {
      window.confirm(message) ? blocker.proceed() : blocker.reset();
      return;
    }

    onBlocked?.({ proceed: blocker.proceed, reset: blocker.reset });
  }, [blocker, message, onBlocked]);

  return null;
};
