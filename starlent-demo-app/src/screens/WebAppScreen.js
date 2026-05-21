import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ALLOWED_HOSTS, WEB_APP_URL } from '../config/env';

function isAllowedUrl(url) {
  try {
    const host = new URL(url).host;
    return ALLOWED_HOSTS.includes(host);
  } catch {
    return false;
  }
}

export default function WebAppScreen() {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const source = useMemo(() => ({ uri: WEB_APP_URL }), []);

  const onRetry = useCallback(() => {
    setHasError(false);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false;
      webViewRef.current?.goBack();
      return true;
    });

    return () => subscription.remove();
  }, [canGoBack]);

  return (
    <View style={styles.container}>
      {hasError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Không t?i du?c ?ng d?ng web</Text>
          <Text style={styles.errorText}>Ki?m tra m?ng ho?c URL trong src/config/env.js r?i th? l?i.</Text>
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>T?i l?i</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <WebView
            key={reloadKey}
            ref={webViewRef}
            source={source}
            startInLoadingState
            onLoadStart={() => {
              setIsLoading(true);
              setHasError(false);
            }}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={(request) => {
              if (isAllowedUrl(request.url)) return true;
              Linking.openURL(request.url).catch(() => {});
              return false;
            }}
          />

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#ff6a2f" />
              <Text style={styles.loadingText}>Ðang t?i Starlent...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#ff6a2f',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
