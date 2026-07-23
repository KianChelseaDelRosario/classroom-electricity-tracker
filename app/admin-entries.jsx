import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  getCoveredMinutes,
  formatDuration,
  todayKey,
  formatDisplayDate,
} from '../lib/calculations';
import { getEntriesForDate, deleteEntry } from '../lib/storage';

function formatTimeRange(onIso, offIso) {
  const opts = { hour: 'numeric', minute: '2-digit' };
  const on = new Date(onIso).toLocaleTimeString([], opts);
  const off = new Date(offIso).toLocaleTimeString([], opts);
  return `${on} – ${off}`;
}

export default function AdminEntries() {
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  function handleDelete(entry) {
    Alert.alert(
      'Delete this entry?',
      `${entry.appliance} in ${entry.classroom} (${formatTimeRange(entry.onTime, entry.offTime)}). This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(entry.id);
            load();
          },
        },
      ]
    );
  }

  // Bar chart data: total covered minutes per appliance, today, school-wide.
  const applianceNames = [...new Set(entries.map((e) => e.appliance))];
  const chartData = applianceNames
    .map((name) => {
      const intervals = entries
        .filter((e) => e.appliance === name)
        .map((e) => ({ start: new Date(e.onTime), end: new Date(e.offTime) }));
      return { name, minutes: getCoveredMinutes(intervals) };
    })
    .sort((a, b) => b.minutes - a.minutes);
  const maxMinutes = Math.max(1, ...chartData.map((d) => d.minutes));

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.onTime) - new Date(b.onTime)
  );

  return (
    <FlatList
      style={styles.container}
      data={sortedEntries}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View>
          <Text style={styles.dateLabel}>{formatDisplayDate(todayKey())}</Text>
          <Text style={styles.sectionTitle}>Usage by appliance</Text>

          {chartData.length === 0 ? (
            <Text style={styles.emptyText}>Nothing logged yet today.</Text>
          ) : (
            <View style={styles.chart}>
              {chartData.map((item) => (
                <View key={item.name} style={styles.chartRow}>
                  <Text style={styles.chartLabel} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${(item.minutes / maxMinutes) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartValue}>{formatDuration(item.minutes)}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
            All entries ({sortedEntries.length})
          </Text>
          <Text style={styles.hint}>Tap the ✕ to delete an entry.</Text>
        </View>
      }
      ListEmptyComponent={
        chartData.length > 0 ? null : (
          <Text style={styles.emptyText}>No entries to show.</Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.entryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.entryTitle}>
              {item.appliance} · {item.classroom}
            </Text>
            <Text style={styles.entryTime}>{formatTimeRange(item.onTime, item.offTime)}</Text>
          </View>
          <Pressable onPress={() => handleDelete(item)} style={styles.deleteButton} hitSlop={8}>
            <Text style={styles.deleteButtonText}>✕</Text>
          </Pressable>
        </View>
      )}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  dateLabel: { fontSize: 12, color: '#999', fontWeight: '500', marginBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1b1b1b', marginBottom: 12 },
  emptyText: { fontSize: 13, color: '#999', paddingVertical: 8 },
  chart: { marginBottom: 24 },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chartLabel: { width: 90, fontSize: 12, color: '#333' },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: '#e3f2fd',
    borderRadius: 7,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#0d47a1', borderRadius: 7 },
  chartValue: { width: 56, fontSize: 12, color: '#333', textAlign: 'right' },
  hint: { fontSize: 12, color: '#999', marginBottom: 8 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  entryTitle: { fontSize: 14, fontWeight: '600', color: '#1b1b1b' },
  entryTime: { fontSize: 12, color: '#888', marginTop: 2 },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdecea',
  },
  deleteButtonText: { color: '#c62828', fontSize: 15, fontWeight: '600' },
});
