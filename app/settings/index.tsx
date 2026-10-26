// app/settings/index.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, ArrowLeft, User, Shield } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Disconnessione', 'Sei sicuro di voler uscire dal tuo account?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Esci',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Impostazioni</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* INFORMAZIONI UTENTE */}
      <View style={styles.section}>
        <Text style={styles.sectionHeaderTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <User size={20} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email registrata</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/D'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* INFORMAZIONI SU DAILYOS */}
      <View style={styles.section}>
        <Text style={styles.sectionHeaderTitle}>Informazioni</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Shield size={20} color={theme.colors.textMuted} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>DailyOS Mobile</Text>
              <Text style={styles.infoValue}>Versione 1.0.0 (MVP)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* PULSANTE LOGOUT */}
      <Pressable style={styles.logoutButton} onPress={handleSignOut}>
        <LogOut size={20} color={theme.colors.error} />
        <Text style={styles.logoutText}>Disconnetti Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.error,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginTop: 'auto',
    marginBottom: theme.spacing.md,
  },
  logoutText: {
    color: theme.colors.error,
    fontWeight: 'bold',
    fontSize: 15,
  },
});