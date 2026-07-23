import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>CLASSROOM ELECTRICITY TRACKER</Text>
        <Text style={styles.heroTitle}>Every hour logged is a step toward using less.</Text>
        <Text style={styles.heroSubtitle}>Who's logging in today?</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={styles.teacherButton}
          onPress={() => router.push({ pathname: '/select-floor', params: { role: 'teacher' } })}
        >
          <Text style={styles.teacherButtonText}>I'm a teacher</Text>
          <Text style={styles.buttonSubtext}>Log appliance usage for my classroom</Text>
        </Pressable>

        <Pressable
          style={styles.patrollerButton}
          onPress={() => router.push({ pathname: '/select-floor', params: { role: 'patroller' } })}
        >
          <Text style={styles.patrollerButtonText}>I'm an energy patroller</Text>
          <Text style={styles.buttonSubtextDark}>Log light bulb usage (1-4)</Text>
        </Pressable>

        <Pressable style={styles.adminButton} onPress={() => router.push('/admin-login')}>
          <Text style={styles.adminButtonText}>I'm the admin</Text>
          <Text style={styles.buttonSubtextMuted}>View usage across all classrooms</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { backgroundColor: '#0d47a1', padding: 24, paddingTop: 32 },
  heroEyebrow: { color: '#bbdefb', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 10 },
  heroSubtitle: { color: '#e3f2fd', fontSize: 14 },
  buttons: { padding: 20 },
  teacherButton: {
    backgroundColor: '#0d47a1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  teacherButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 3 },
  buttonSubtext: { color: '#bbdefb', fontSize: 12 },
  patrollerButton: {
    backgroundColor: '#4fc3f7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  patrollerButtonText: { color: '#0d2b4e', fontSize: 16, fontWeight: '700', marginBottom: 3 },
  buttonSubtextDark: { color: '#0d2b4e', fontSize: 12, opacity: 0.8 },
  adminButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#0d47a1',
  },
  adminButtonText: { color: '#0d47a1', fontSize: 16, fontWeight: '700', marginBottom: 3 },
  buttonSubtextMuted: { color: '#666', fontSize: 12 },
});