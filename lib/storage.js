import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const ENTRIES = 'entries';

// Entry shape:
// { id, date: "2026-07-12", classroom, appliance, onTime: ISOString, offTime: ISOString }

export async function getEntries() {
  const snapshot = await getDocs(collection(db, ENTRIES));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveEntries(newEntries) {
  await Promise.all(
    newEntries.map((entry) => setDoc(doc(db, ENTRIES, entry.id), entry))
  );
  return getEntries();
}

export async function getEntriesForDate(dateKey) {
  const q = query(collection(db, ENTRIES), where('date', '==', dateKey));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function clearEntries() {
  const snapshot = await getDocs(collection(db, ENTRIES));
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}

export async function deleteEntry(id) {
  await deleteDoc(doc(db, ENTRIES, id));
}