import domready from 'domready';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createIntl } from 'react-intl';
import { IntlProvider } from 'react-intl-redux';
import Logger from './features/Logger';
import debug from 'debug';
import deviceInfo from './deviceInfo';
import UnsupportedBrowser from './components/UnsupportedBrowser';
import ConfigDocumentation from './components/ConfigDocumentation';
import ConfigError from './components/ConfigError';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import { store } from './store/store';
import * as serviceWorker from './serviceWorker';
import { detectDevice } from 'mediasoup-client';
import { recorder } from './features/BrowserRecorder';
import { config, configError } from './config';

import '@arco-design/web-react/dist/css/arco.css';
import './index.css';
import { App } from './App';

const supportedBrowsers = {
  windows: {
    'internet explorer': '>12',
    'microsoft edge': '>18',
  },
  safari: '>12',
  firefox: '>=60',
  chrome: '>=74',
  chromium: '>=74',
  opera: '>=62',
  'samsung internet for android': '>=11.1.1.52',
  electron: '>=18.1.0',
};

const intl = createIntl({ locale: 'en', defaultLocale: 'en' });

recorder.intl = intl;

if (process.env.NODE_ENV !== 'production') {
  debug.enable('* -engine* -socket* -RIE* *WARN* *ERROR*');
}

const logger = new Logger();

const theme = createTheme(config.theme as any);

domready(() => {
  logger.debug('DOM ready');

  run();
});

function run() {
  logger.debug('run() [environment:%s]', process.env.NODE_ENV);

  const urlParser = new URL(window.location.href);
  const parameters = urlParser.searchParams;
  const showConfigDocumentationPath = parameters.get('config') === 'true';

  // Get current device.
  const device = deviceInfo();

  let unsupportedBrowser = false;

  let webrtcUnavailable = false;

  if (detectDevice() === undefined) {
    logger.error('Your browser is not supported [deviceInfo:"%o"]', device);

    unsupportedBrowser = true;
  } else if (
    navigator.mediaDevices === undefined ||
    navigator.mediaDevices.getUserMedia === undefined ||
    window.RTCPeerConnection === undefined
  ) {
    logger.error('Your browser is not supported [deviceInfo:"%o"]', device);

    webrtcUnavailable = true;
  } else if (
    !device.bowser.satisfies(config.supportedBrowsers || supportedBrowsers)
  ) {
    logger.error('Your browser is not supported [deviceInfo:"%o"]', device);

    unsupportedBrowser = true;
  } else {
    logger.debug('Your browser is supported [deviceInfo:"%o"]', device);
  }

  if (unsupportedBrowser || webrtcUnavailable) {
    render(
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
          <IntlProvider locale={intl.locale}>
            <UnsupportedBrowser
              webrtcUnavailable={webrtcUnavailable}
              platform={device.platform}
            />
          </IntlProvider>
        </MuiThemeProvider>
      </Provider>,
      document.getElementById('tailchat-meeting')
    );

    return;
  }

  if (showConfigDocumentationPath) {
    render(
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
          <IntlProvider locale={intl.locale}>
            <ConfigDocumentation />
          </IntlProvider>
        </MuiThemeProvider>
      </Provider>,
      document.getElementById('tailchat-meeting')
    );

    return;
  }

  if (configError) {
    render(
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
          <IntlProvider locale={intl.locale}>
            <ConfigError configError={configError} />
          </IntlProvider>
        </MuiThemeProvider>
      </Provider>,
      document.getElementById('tailchat-meeting')
    );

    return;
  }

  render(
    <App theme={theme} locale={intl.locale} />,
    document.getElementById('tailchat-meeting')
  );
}

serviceWorker.unregister();
