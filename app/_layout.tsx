// app/_layout.tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { theme } from '../src/theme';

// Inizializziamo il client per le richieste asincrone
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // I dati restano freschi per 5 minuti
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* View root con il colore di sfondo scuro per evitare flash bianchi */}
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style="light" />
        
        {/* Navigatore principale */}
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          {/* La rotta index sarà la nostra prima schermata, poi creeremo le (tabs) */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}