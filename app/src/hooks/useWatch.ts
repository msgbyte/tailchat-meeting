import { useMemoizedFn } from 'ahooks';
import { useLayoutEffect } from 'react';

export function useWatch(deps: React.DependencyList, callback: () => void) {
  const fn = useMemoizedFn(callback);
  useLayoutEffect(() => {
    fn();
  }, [deps]);
}
