import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

export const ReduxProvider: React.FC<React.PropsWithChildren> = React.memo(
  (props) => {
    return <Provider store={store}>{props.children}</Provider>;
  }
);
ReduxProvider.displayName = 'ReduxProvider';
