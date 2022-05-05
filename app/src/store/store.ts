import {
  createMigrate,
  persistStore,
  persistReducer,
  PersistConfig,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { diff } from 'deep-object-diff';
import { AppState, rootReducer } from './reducers/rootReducer';
import Logger from '../features/Logger';
import { config } from '../config';
import { configureStore } from '@reduxjs/toolkit';

const logger = new Logger('store');

const migrations = {
  // initial version 0: we will clean up all historical data
  // from local storage for the time
  // before we began with migration versioning
  // next version 1 we have to implement like this:
  // oldValue = undefined; // will remove oldValue from next local storage
  // new values can be defined from app/public/config.js and go that way to new local storage
  // redux-persist will save a version number to each local store.
  // Next time store is initialized it will check if there are newer versions here in migrations
  // and iterate over all defined greater version functions until version in persistConfig is reached.
  0: (state) => {
    state = {};

    return { ...state };
  },
  1: (state) => {
    state.me = undefined;

    return { ...state };
  },
  2: (state) => {
    state.settings.autoGainControl = true;

    return { ...state };
  },
  // Next version
  //	4 : (state) =>
  //	{
  //		return { ...state };
  //	}
};

const persistConfig: PersistConfig<AppState> = {
  key: 'root',
  storage,
  // migrate will iterate state over all version-functions
  // from migrations until version is reached
  version: 2,
  migrate: createMigrate(migrations, { debug: true }),
  stateReconciler: autoMergeLevel2,
  whitelist: ['settings', 'intl', 'config'],
};

const pReducer = persistReducer<AppState>(persistConfig, rootReducer);

const initialState: any = {
  intl: {
    locale: null,
    messages: null,
  },
  // ...other initialState
};

export const store = configureStore({
  reducer: pReducer,
  preloadedState: initialState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // TODO: 不推荐的配置, 待优化
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store, null, () => {
  // Check if the app config differs from the stored version.
  const currentConfig = (store as any).getState().config;
  const changed = diff(currentConfig, config);
  const changedKeys = Object.keys(changed);

  if (changedKeys.length) {
    logger.debug('store config changed:', changed);
    const changedSettings = {};

    changedKeys.forEach((key) => {
      changedSettings[key] = config[key];
    });

    store.dispatch({ type: 'SETTINGS_UPDATE', payload: changedSettings });
    store.dispatch({ type: 'CONFIG_SET', payload: config });
  }
});
