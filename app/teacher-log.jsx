import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { APPLIANCES, CLASSROOMS, ROOMS_BY_FLOOR } from '../constants/appliances';
import { getDurationMinutes, formatDuration, todayKey, formatDisplayDate } from '../lib/calculations';
import { saveEntries } from '../lib/storage';

let rowId = 0;
function makeRow() {
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);
  rowId += 1;
  return { id: rowId, appliance: APPLIANCES[0], onTime: now, offTime: later };
}

export default function LogUsage() {
  const router = useRouter();
  const { floor } = useLocalSearchParams();
  const rooms = ROOMS_BY_FLOOR[floor] || CLASSROOMS;
  const [classroom, setClassroom] = useState(rooms[0]);
  const [rows, setRows] = useState([makeRow(), makeRow()]);
  const [pickerTarget, setPickerTarget] = useState(null); // { rowId, field }

  const totalMinutes = rows.reduce(
    (sum, r) => sum + getDurationMinutes(r.onTime, r.offTime),
    0
  );

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, makeRow()]);
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function openPicker(id, field) {
    setPickerTarget({ id, field });
  }

  function onPickerChange(event, selectedDate) {
    const target = pickerTarget;
    setPickerTarget(null);
    if (!selectedDate || !target) return;

    const row = rows.find((r) => r.id === target.id);
    if (!row) return;

    if (target.field === 'offTime' && selectedDate.getTime() <= row.onTime.getTime()) {
      Alert.alert('Invalid time', 'End time must be after the start time.');
      return;
    }
    if (target.field === 'onTime' && selectedDate.getTime() >= row.offTime.getTime()) {
      Alert.alert('Invalid time', 'Start time must be before the end time.');
      return;
    }

    updateRow(target.id, target.field, selectedDate);
  }

  async function handleSubmit() {
    const badRow = rows.find((r) => r.offTime.getTime() <= r.onTime.getTime());
    if (badRow) {
      Alert.alert(
        'Fix a time before submitting',
        `"${badRow.appliance}" has an end time that isn't after its start time.`
      );
      return;
    }

    const date = todayKey();
    const entries = rows.map((r) => ({
      id: `${date}-${classroom}-${r.id}-${Date.now()}`,
      date,
      classroom,
      appliance: r.appliance,
      onTime: r.onTime.toISOString(),
      offTime: r.offTime.toISOString(),
    }));
    await saveEntries(entries);
    Alert.alert(
      'Usage sent to admin',
      'Would you like to log another usage?',
      [
        { text: 'No', style: 'cancel', onPress: () => router.push('/') },
        {
          text: 'Yes',
          onPress: () =>
            router.push({ pathname: '/select-floor', params: { role: 'teacher' } }),
        },
      ]
    );
  }

  const activeRow = pickerTarget ? rows.find((r) => r.id === pickerTarget.id) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.dateText}>
        {floor ? `${floor} · ` : ''}{formatDisplayDate(new Date())}
      </Text>

      <Text style={styles.label}>Classroom</Text>
      <View style={styles.chipRow}>
        {rooms.map((c) => (
          <Pressable
            key={c}
            style={[styles.chip, classroom === c && styles.chipActive]}
            onPress={() => setClassroom(c)}
          >
            <Text style={[styles.chipText, classroom === c && styles.chipTextActive]}>
              {c}
            </Text>
          </Pressable>
        ))}
      </View>

      {rows.map((row) => (
        <View key={row.id} style={styles.entry}>
          <View style={styles.chipRow}>
            {APPLIANCES.map((a) => (
              <Pressable
                key={a}
                style={[styles.chipSmall, row.appliance === a && styles.chipActive]}
                onPress={() => updateRow(row.id, 'appliance', a)}
              >
                <Text
                  style={[styles.chipText, row.appliance === a && styles.chipTextActive]}
                >
                  {a}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.timeRow}>
            <Pressable style={styles.timeButton} onPress={() => openPicker(row.id, 'onTime')}>
              <Text style={styles.timeButtonLabel}>On</Text>
              <Text style={styles.timeButtonValue}>
                {row.onTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
            <Text style={styles.arrow}>→</Text>
            <Pressable style={styles.timeButton} onPress={() => openPicker(row.id, 'offTime')}>
              <Text style={styles.timeButtonLabel}>Off</Text>
              <Text style={styles.timeButtonValue}>
                {row.offTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
            <Pressable onPress={() => removeRow(row.id)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>✕</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable style={styles.addButton} onPress={addRow}>
        <Text style={styles.addButtonText}>+ Add appliance</Text>
      </Pressable>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total logged today</Text>
        <Text style={styles.totalValue}>{formatDuration(totalMinutes)}</Text>
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit to admin</Text>
      </Pressable>

      {pickerTarget && activeRow && (
        <DateTimePicker
          value={activeRow[pickerTarget.field]}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  dateText: { fontSize: 13, color: '#999', marginBottom: 12, fontWeight: '500' },
  label: { fontSize: 13, color: '#666', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chipActive: { backgroundColor: '#0d47a1', borderColor: '#0d47a1' },
  chipText: { fontSize: 13, color: '#333' },
  chipTextActive: { color: '#fff' },
  entry: {
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  timeButtonLabel: { fontSize: 11, color: '#999' },
  timeButtonValue: { fontSize: 15, fontWeight: '600', color: '#1b1b1b' },
  arrow: { color: '#999' },
  removeButton: { padding: 8 },
  removeButtonText: { color: '#c62828', fontSize: 16 },
  addButton: {
    borderWidth: 1,
    borderColor: '#0d47a1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#0d47a1', fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 16,
  },
  totalLabel: { fontSize: 13, color: '#666' },
  totalValue: { fontSize: 20, fontWeight: '700' },
  submitButton: {
    backgroundColor: '#0d47a1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});