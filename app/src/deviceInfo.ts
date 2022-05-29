import bowser from 'bowser';

(window as any).BB = bowser;

export interface DeviceInfo {
  flag: 'chrome' | 'firefox' | 'safari' | 'opera' | 'edge' | 'unknown';
  os: string; // ios, android, linux...
  platform: string; // mobile, desktop, tablet
  name: string;
  version: string;
  bowser: bowser.Parser.Parser;
}

export function deviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  const browser = bowser.getParser(ua);

  let flag: DeviceInfo['flag'];

  if (browser.satisfies({ chrome: '>=0', chromium: '>=0' })) flag = 'chrome';
  else if (browser.satisfies({ firefox: '>=0' })) flag = 'firefox';
  else if (browser.satisfies({ safari: '>=0' })) flag = 'safari';
  else if (browser.satisfies({ opera: '>=0' })) flag = 'opera';
  else if (browser.satisfies({ 'microsoft edge': '>=0' })) flag = 'edge';
  else flag = 'unknown';

  return {
    flag,
    os: browser.getOSName(true), // ios, android, linux...
    platform: browser.getPlatformType(true), // mobile, desktop, tablet
    name: browser.getBrowserName(true),
    version: browser.getBrowserVersion(),
    bowser: browser,
  };
}

export default deviceInfo;
