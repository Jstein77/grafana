import { useEffect } from 'react';

import { type GrafanaLocation } from '@grafana/data';
import { locationService } from '@grafana/runtime';

interface PromptProps {
  when?: boolean;
  message: string | ((location: GrafanaLocation) => string | boolean);
}

export const Prompt = ({ message, when = true }: PromptProps) => {
  useEffect(() => {
    if (!when) {
      return undefined;
    }

    const prompt = typeof message === 'string' ? message : (location: GrafanaLocation) => message(location);
    return locationService.block(prompt);
  }, [when, message]);

  return null;
};
