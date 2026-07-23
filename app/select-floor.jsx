import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FLOORS } from '../constants/appliances';

export default function SelectFloor() {
  const router = useRouter();
  const { role } = useLocalSearchParams(); // 'teacher' | 'energy patroller'

  const destination = role === 'patroller' ? '/energypatroller-log' : '/teacher-log';
  const accentColor = role === 'patroller' ? '#0288d1' : '#0d47a1';

  function handleSelect(floor) {
    router.push({ pathname: destination, params: { floor } });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Which floor are you on?</Text>
      <Text style={styles.subtitle}>
        {role === 'patroller' ? 'Pick a floor to log light bulb usage.' : 'Pick a floor to log appliance usage.'}
      </Text>

      {FLOORS.map((floor) => (
        <Pressable
          key={floor}
          style={[styles.floorButton, { borderColor: accentColor }]}
          onPress={() => handleSelect(floor)}
        >
          <Text style={[styles.floorButtonText, { color: accentColor }]}>{floor}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, color: '#1b1b1b' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 28 },
  floorButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  floorButtonText: { fontSize: 16, fontWeight: '600' },
});