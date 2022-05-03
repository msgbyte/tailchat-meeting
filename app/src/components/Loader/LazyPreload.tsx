import React from 'react';

export const LazyPreload = (
  importStatement
): React.LazyExoticComponent<React.ComponentType<any>> & {
  preload: () => void;
} => {
  const Component: any = React.lazy(importStatement);

  Component.preload = importStatement;

  return Component;
};
