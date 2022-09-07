import { MuiThemeProvider, Theme } from '@material-ui/core';
import React, { Suspense, useMemo, useRef } from 'react';
import { IntlProvider } from 'react-intl-redux';
import { persistor, store } from './store/store';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { LoadingView } from './components/Loader/LoadingView';
import RoomContext from './RoomContext';
import { RoomClient } from './RoomClient';
import { generateRandomString } from './utils';
import { meActions } from './store/slices/me';
import { config } from './config';
import { ConfigProvider } from '@arco-design/web-react';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter, HashRouter, Route, Switch } from 'react-router-dom';
import isElectron from 'is-electron';
import deviceInfo from './deviceInfo';
import JoinDialog from './components/JoinDialog';
import LoginDialog from './components/AccessControl/LoginDialog';
import { LazyPreload } from './components/Loader/LazyPreload';
import { ReduxProvider } from './store/Provider';
import { roomActions } from './store/slices/room';

const Main = LazyPreload(
  () => import(/* webpackChunkName: "app" */ './components/Main')
);

let Router: any;

if (isElectron()) {
  Router = HashRouter;
} else {
  Router = BrowserRouter;
}

interface AppProps {
  theme: Theme;
  locale: string;
}
export const App: React.FC<AppProps> = React.memo((props) => {
  const modalContainerRef = useRef<HTMLDivElement>();

  const roomClient = useMemo(() => {
    const urlParser = new URL(window.location.href);
    const parameters = urlParser.searchParams;

    const accessCode = parameters.get('code');
    const produce = parameters.get('produce') !== 'false';
    const forceTcp = parameters.get('forceTcp') === 'true';
    const displayName = parameters.get('displayName');
    const avatarUrl = parameters.get('avatarUrl');
    const from = parameters.get('from');
    const muted = parameters.get('muted') === 'true';
    const headless = parameters.get('headless');
    const device = deviceInfo();

    // 生成随机的唯一标识
    const peerId = generateRandomString(8).toLowerCase();
    store.dispatch(
      meActions.setMe({
        peerId,
        loginEnabled: config.loginEnabled,
      })
    );

    if (avatarUrl) {
      store.dispatch(meActions.setPicture(avatarUrl));
    }
    if (from) {
      store.dispatch(meActions.setFrom(from));
    }

    const roomClient = new RoomClient({
      peerId,
      accessCode,
      device,
      produce,
      headless,
      forceTcp,
      displayName,
      muted,
    });

    store.dispatch(roomActions.set('client', roomClient));

    return roomClient;
  }, []);

  return (
    <ReduxProvider>
      <MuiThemeProvider theme={props.theme}>
        <IntlProvider locale={props.locale}>
          <PersistGate loading={<LoadingView />} persistor={persistor}>
            <RoomContext.Provider value={roomClient}>
              <ConfigProvider
                getPopupContainer={() => modalContainerRef.current}
              >
                <SnackbarProvider>
                  <Router basename={'/'}>
                    <Suspense fallback={<LoadingView />}>
                      <React.Fragment>
                        <Switch>
                          <Route exact path="/" component={JoinDialog} />
                          <Route
                            exact
                            path="/login_dialog"
                            component={LoginDialog}
                          />
                          <Route path="/room/:id" component={Main} />
                        </Switch>
                        <div
                          ref={modalContainerRef}
                          className="modalContainer"
                        />
                      </React.Fragment>
                    </Suspense>
                  </Router>
                </SnackbarProvider>
              </ConfigProvider>
            </RoomContext.Provider>
          </PersistGate>
        </IntlProvider>
      </MuiThemeProvider>
    </ReduxProvider>
  );
});
App.displayName = 'App';
