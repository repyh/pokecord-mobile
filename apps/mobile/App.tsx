import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
  const [status, setStatus] = useState('Ready to connect');
  const [busy, setBusy] = useState(false);

  async function checkConnection() {
    if (!apiUrl) {
      setStatus(
        'Set EXPO_PUBLIC_API_URL in apps/mobile/.env to connect your backend.',
      );
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/ready`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Backend is not ready');
      setStatus('Connected · backend and database ready');
    } catch {
      setStatus(
        'Could not connect. Check the API address and backend readiness.',
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>POKECORD MOBILE · DEVELOPMENT</Text>
          <Text style={styles.title}>
            Your next adventure{'\n'}starts with a walk.
          </Text>
          <Text style={styles.description}>
            The app is running. Next up: connect your phone, track a walk, and
            discover your first encounter.
          </Text>
          <View style={styles.card}>
            <Text style={styles.label}>CONNECTION</Text>
            <Text style={styles.status}>{status}</Text>
            <Text style={styles.address}>
              {apiUrl ?? 'Backend address not configured'}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => {
                void checkConnection();
              }}
              style={[styles.button, busy && styles.disabled]}
            >
              <Text style={styles.buttonText}>
                {busy ? 'Connecting…' : 'Check backend'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>FIRST MILESTONE</Text>
            <Text style={styles.status}>GPS → movement → encounter</Text>
            <Text style={styles.description}>
              Walking and background tracking are coming next. No location is
              collected by this starter screen.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#101c24' },
  content: {
    padding: 24,
    paddingTop: 48,
    gap: 24,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  eyebrow: {
    color: '#90e0b0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: { color: '#f5f8f2', fontSize: 36, fontWeight: '800', lineHeight: 44 },
  description: { color: '#b9c8ce', fontSize: 16, lineHeight: 25 },
  card: { padding: 24, backgroundColor: '#1b2c37', borderRadius: 18, gap: 14 },
  label: {
    color: '#90e0b0',
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  status: { color: '#f5f8f2', fontSize: 20, fontWeight: '600' },
  address: { color: '#b9c8ce', fontSize: 13 },
  button: {
    backgroundColor: '#90e0b0',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#10291d', fontSize: 16, fontWeight: '700' },
});
