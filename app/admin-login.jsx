import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getAdminRequestStatus } from '../lib/adminRequests';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // If the admin already has an active session (chose "stay logged in"
  // earlier), skip straight to the dashboard instead of asking again.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const status = await getAdminRequestStatus(user.uid);
        if (status === 'approved') {
          router.replace('/dashboard');
        } else {
          // Not approved (or no request found, e.g. the original admin
          // account created directly in the Firebase console) - only
          // let through if there's no request doc at all, meaning this
          // is the original admin account, not a pending registration.
          if (status === null) {
            router.replace('/dashboard');
          } else {
            await signOut(auth);
            setCheckingSession(false);
          }
        }
      } else {
        setCheckingSession(false);
      }
    });
    return unsubscribe;
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const status = await getAdminRequestStatus(credential.user.uid);

      if (status !== null && status !== 'approved') {
        await signOut(auth);
        Alert.alert(
          'Not approved yet',
          'The main admin still needs to approve your registration before you can log in.'
        );
        return;
      }

      setPassword('');
      router.replace('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        Alert.alert('Login error', 'Please re-enter email.');
      } else if (err.code === 'auth/wrong-password') {
        Alert.alert('Login error', 'Please re-enter password.');
      } else {
        Alert.alert('Login error', 'Please re-enter email or password.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#0d47a1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin login</Text>
      <Text style={styles.subtitle}>Sign in to view the dashboard.</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoFocus
      />

      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword((prev) => !prev)} style={styles.showButton}>
          <Text style={styles.showButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log in</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/admin-register')}>
        <Text style={styles.linkText}>Need an account? Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, color: '#1b1b1b' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  showButton: { paddingHorizontal: 14, paddingVertical: 12 },
  showButtonText: { color: '#0d47a1', fontSize: 13, fontWeight: '600' },
  button: {
    backgroundColor: '#0d47a1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkText: { color: '#0d47a1', fontSize: 13, textAlign: 'center', marginTop: 4 },
});