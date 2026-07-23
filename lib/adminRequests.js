import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const REQUESTS = 'adminRequests';

// Called right after the new account is created in Firebase Auth.
export async function createAdminRequest(uid, email) {
  await setDoc(doc(db, REQUESTS, uid), {
    email,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  });
}

// Checked every time someone tries to log in, to see if they're cleared yet.
export async function getAdminRequestStatus(uid) {
  const snapshot = await getDoc(doc(db, REQUESTS, uid));
  return snapshot.exists() ? snapshot.data().status : null;
}

export async function getPendingRequests() {
  const q = query(collection(db, REQUESTS), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function approveRequest(uid) {
  await updateDoc(doc(db, REQUESTS, uid), { status: 'approved' });
}

export async function rejectRequest(uid) {
  await deleteDoc(doc(db, REQUESTS, uid));
}
