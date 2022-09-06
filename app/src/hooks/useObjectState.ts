import { useMemoizedFn } from 'ahooks';
import { useState } from 'react';

/**
 * 类似class的setState
 */
export function useObjectState<T extends Record<string, unknown>>(
  defaultValue: T
): [T, (newState: T) => void] {
  const [state, _setState] = useState<T>(defaultValue);

  const setState = useMemoizedFn((obj) => {
    _setState((state) => ({
      ...state,
      ...obj,
    }));
  });

  return [state, setState];
}
