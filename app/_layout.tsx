// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../src/theme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minuti
      networkMode: 'offlineFirst', // Mantieni i dati in cache se manca la rete
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

function NavigationGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/today');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings/index" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style="light" />
            <NavigationGuard />
          </View>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}