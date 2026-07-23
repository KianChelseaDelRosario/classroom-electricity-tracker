import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createAdminRequest } from '../lib/adminRequests';

export default function AdminRegister() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter both an email and a password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await createAdminRequest(credential.user.uid, email.trim());
      // They shouldn't be treated as logged in until approved.
      await signOut(auth);

      Alert.alert(
        'Registration submitted',
        "The main admin needs to approve your account before you can log in. You'll be able to sign in once that happens.",
        [{ text: 'OK', onPress: () => router.replace('/admin-login') }]
      );
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        Alert.alert('Already registered', 'An account with this email already exists.');
      } else if (err.code === 'auth/invalid-email') {
        Alert.alert('Invalid email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Registration failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register as admin</Text>
      <Text style={styles.subtitle}>
        Your request will need approval from the main admin before you can log in.
      </Text>

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
          placeholder="Password (at least 6 characters)"
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword((prev) => !prev)} style={styles.showButton}>
          <Text style={styles.showButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign up</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.replace('/admin-login')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
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
  passwordInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, fontSize: 15 },
  showButton: { paddingHorizontal: 14, paddingVertical: 12 },
  showButtonText: { color: '#0d47a1', fontSize: 13, fontWeight: '600' },
  button: {
    backgroundColor: '#0d47a1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkText: { color: '#0d47a1', fontSize: 13, textAlign: 'center' },
});
