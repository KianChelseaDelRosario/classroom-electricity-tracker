import { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  Alert,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useRouter, useNavigation } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { CLASSROOMS } from '../constants/appliances';
import { getCoveredMinutes, formatDuration, todayKey, formatDisplayDate } from '../lib/calculations';
import { getEntriesForDate, clearEntries } from '../lib/storage';

function formatTimeRange(onIso, offIso) {
  const opts = { hour: 'numeric', minute: '2-digit' };
  const on = new Date(onIso).toLocaleTimeString([], opts);
  const off = new Date(offIso).toLocaleTimeString([], opts);
  return `${on} – ${off}`;
}

export default function Dashboard() {
  const router = useRouter();
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [openRooms, setOpenRooms] = useState(new Set());

  function handleBack() {
    Alert.alert(
      'Leaving the dashboard',
      'Would you like to log out, or stay logged in and keep browsing the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await signOut(auth);
            router.replace('/');
          },
        },
        {
          text: 'Stay logged in',
          onPress: () => router.push('/'),
        },
      ]
    );
  }

  // Custom header back button
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={handleBack} hitSlop={8} style={{ paddingHorizontal: 4 }}>
          <Text style={{ color: '#0d47a1', fontSize: 16 }}>‹ Back</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  // Android hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, []);

  const load = useCallback(async () => {
    const data = await getEntriesForDate(todayKey());
    setEntries(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function toggleRoom(room) {
    setOpenRooms((prev) => {
      const next = new Set(prev);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  }

  function handleReset() {
    Alert.alert(
      'Clear all data?',
      'This deletes every logged entry on this device. This can\'t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear data',
          style: 'destructive',
          onPress: async () => {
            await clearEntries();
            await load();
          },
        },
      ]
    );
  }

  // Overall hours electricity was on today, school-wide (overlapping usage
  // across rooms/appliances counted once, not double-added).
  const allIntervals = entries.map((e) => ({
    start: new Date(e.onTime),
    end: new Date(e.offTime),
  }));
  const totalMinutes = getCoveredMinutes(allIntervals);

  const roomData = CLASSROOMS.map((room) => {
    const roomEntries = entries
      .filter((e) => e.classroom === room)
      .slice()
      .sort((a, b) => new Date(a.onTime) - new Date(b.onTime));
    const minutes = getCoveredMinutes(
      roomEntries.map((e) => ({ start: new Date(e.onTime), end: new Date(e.offTime) }))
    );
    return { room, entries: roomEntries, minutes, hasData: roomEntries.length > 0 };
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>{formatDisplayDate(todayKey())}</Text>
        <Text style={styles.heroTitle}>
          Electricity was used for {formatDuration(totalMinutes)}.
        </Text>
      </View>

      {roomData.map((room) => (
        <View key={room.room}>
          <Pressable style={styles.dropdownHeader} onPress={() => toggleRoom(room.room)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dropdownHeaderText}>{room.room}</Text>
              <Text style={styles.dropdownHeaderSubtext}>
                {room.hasData ? `${room.entries.length} appliance log${room.entries.length === 1 ? '' : 's'}` : 'Not yet logged today'}
              </Text>
            </View>
            <Text style={styles.roomTotal}>
              {room.hasData ? formatDuration(room.minutes) : '—'}
            </Text>
            <Text style={styles.chevron}>{openRooms.has(room.room) ? '▾' : '▸'}</Text>
          </Pressable>

          {openRooms.has(room.room) && (
            <View style={styles.dropdownBody}>
              {room.entries.length === 0 ? (
                <Text style={styles.emptyText}>Nothing logged yet today.</Text>
              ) : (
                room.entries.map((e) => (
                  <View key={e.id} style={styles.row}>
                    <Text style={styles.applianceName}>{e.appliance}</Text>
                    <Text style={styles.applianceTime}>
                      {formatTimeRange(e.onTime, e.offTime)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      ))}

      <Pressable style={styles.viewAllButton} onPress={() => router.push('/admin-entries')}>
        <Text style={styles.viewAllButtonText}>View bar graph &amp; all entries</Text>
      </Pressable>

      <Pressable
        style={[styles.viewAllButton, { backgroundColor: '#1565c0' }]}
        onPress={() => router.push('/admin-approvals')}
      >
        <Text style={styles.viewAllButtonText}>Pending admin requests</Text>
      </Pressable>

      <Pressable style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Clear all data</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { backgroundColor: '#0d47a1', padding: 20 },
  heroLabel: { fontSize: 12, fontWeight: '600', color: '#bbdefb', marginBottom: 6 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownHeaderText: { fontSize: 15, fontWeight: '600' },
  dropdownHeaderSubtext: { fontSize: 12, color: '#888', marginTop: 2 },
  roomTotal: { fontSize: 14, fontWeight: '600', color: '#0d47a1' },
  chevron: { fontSize: 16, color: '#0d47a1' },
  dropdownBody: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#fafafa' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  applianceName: { fontSize: 14, color: '#1b1b1b' },
  applianceTime: { fontSize: 13, color: '#555' },
  emptyText: { fontSize: 13, color: '#999', paddingVertical: 12 },
  viewAllButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0d47a1',
    alignItems: 'center',
  },
  viewAllButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  resetButton: {
    margin: 20,
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c62828',
    alignItems: 'center',
  },
  resetButtonText: { color: '#c62828', fontWeight: '600', fontSize: 14 },
});