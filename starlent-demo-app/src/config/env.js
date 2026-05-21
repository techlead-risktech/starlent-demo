import { Platform } from 'react-native';

const LOCAL_IP = '192.168.1.10';
const WEB_PORT = '5173';
const PUBLIC_URL = process.env.EXPO_PUBLIC_WEB_APP_URL;

function getDevUrl() {
  if (PUBLIC_URL) return PUBLIC_URL;
  if (Platform.OS === 'android') {
    // Android emulator should use 10.0.2.2, physical device should use LAN IP.
    return `http://${LOCAL_IP}:${WEB_PORT}`;
  }
  return `http://localhost:${WEB_PORT}`;
}

export const WEB_APP_URL = __DEV__
  ? getDevUrl()
  : 'https://starlent-demo.vercel.app';

export const ALLOWED_HOSTS = [
  'localhost',
  '10.0.2.2',
  LOCAL_IP,
  'starlent-demo.vercel.app',
];

if (PUBLIC_URL) {
  try {
    const host = new URL(PUBLIC_URL).host;
    if (!ALLOWED_HOSTS.includes(host)) ALLOWED_HOSTS.push(host);
  } catch {
    // Ignore malformed env URL; WebView will show retry UI.
  }
}
