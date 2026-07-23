import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getPendingRequests, approveRequest, rejectRequest } from '../lib/adminRequests';

export default function AdminApprovals() {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getPendingRequests();
    setRequests(data);
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

  function handleApprove(request) {
    Alert.alert('Approve this account?', request.email, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          await approveRequest(request.uid);
          load();
        },
      },
    ]);
  }

  function handleReject(request) {
    Alert.alert('Reject this account?', `${request.email} won't be able to log in.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          await rejectRequest(request.uid);
          load();
        },
      },
    ]);
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      data={requests}
      keyExtractor={(item) => item.uid}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={<Text style={styles.title}>Pending admin requests</Text>}
      ListEmptyComponent={<Text style={styles.emptyText}>No pending requests.</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.email}>{item.email}</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.rejectButton} onPress={() => handleReject(item)}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </Pressable>
            <Pressable style={styles.approveButton} onPress={() => handleApprove(item)}>
              <Text style={styles.approveButtonText}>Approve</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#1b1b1b', marginBottom: 16 },
  emptyText: { fontSize: 13, color: '#999' },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  email: { fontSize: 15, fontWeight: '600', color: '#1b1b1b', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c62828',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectButtonText: { color: '#c62828', fontWeight: '600', fontSize: 13 },
  approveButton: {
    flex: 1,
    backgroundColor: '#0d47a1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  approveButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
