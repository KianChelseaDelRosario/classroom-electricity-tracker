import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#e3f2fd' },
        headerTintColor: '#0d47a1',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Electricity Tracker', headerBackVisible: false }}
      />
      <Stack.Screen name="select-floor" options={{ title: 'Select Floor' }} />
      <Stack.Screen name="teacher-log" options={{ title: 'Log Appliance Usage' }} />
      <Stack.Screen name="energypatroller-log" options={{ title: 'Log Light Usage' }} />
      <Stack.Screen name="admin-login" options={{ title: 'Admin Access' }} />
      <Stack.Screen name="admin-register" options={{ title: 'Register' }} />
      <Stack.Screen name="admin-approvals" options={{ title: 'Pending Requests' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="admin-entries" options={{ title: 'All Entries' }} />
    </Stack>
  );
}