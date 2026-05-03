'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}

export async function addUser(prevState: any, formData: FormData) {
  await requireAdmin();
  const username = formData.get('username') as string;
  const fullname = formData.get('fullname') as string || username;
  if (!username) return { error: 'Username is required' };

  const db = getFirebaseAdmin();
  
  // Check if user already exists
  const snapshot = await db.collection('users').where('username', '==', username).get();
  if (!snapshot.empty) {
    return { error: 'User already exists' };
  }

  await db.collection('users').add({
    username,
    fullname: fullname.substring(0, 50),
    has_voted: false,
    voted_for: [],
    voted_at: null
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function removeUser(prevState: any, formData: FormData) {
  await requireAdmin();
  const userId = formData.get('userId') as string;
  if (!userId) return { error: 'User ID is required' };

  const db = getFirebaseAdmin();
  
  // Need to also clean up votes where this user was voted for
  const batch = db.batch();
  batch.delete(db.collection('users').doc(userId));
  
  // Optionally reset votes for people who voted for this user
  // Using array-contains to find users who voted for the deleted user
  const votesRef = db.collection('users').where('voted_for', 'array-contains', userId);
  const votesSnapshot = await votesRef.get();
  votesSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const newVotedFor = (data.voted_for || []).filter((id: string) => id !== userId);
    batch.update(doc.ref, { 
      voted_for: newVotedFor,
      has_voted: newVotedFor.length > 0
    });
  });

  await batch.commit();

  revalidatePath('/admin');
  return { success: true };
}

export async function updatePasswords(prevState: any, formData: FormData) {
  await requireAdmin();
  const adminPassword = formData.get('adminPassword') as string;
  const studentPassword = formData.get('studentPassword') as string;

  if (!adminPassword || !studentPassword) {
    return { error: 'Both passwords are required' };
  }

  const db = getFirebaseAdmin();
  await db.collection('settings').doc('global').set({
    admin_password: adminPassword,
    student_password: studentPassword
  }, { merge: true });

  revalidatePath('/admin');
  return { success: true };
}

export async function bulkAddUsers(prevState: any, formData: FormData) {
  await requireAdmin();
  const usernamesText = formData.get('usernames') as string;
  if (!usernamesText) return { error: 'Entries are required' };

  const lines = usernamesText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return { error: 'No valid entries provided' };

  const usersToAdd = lines.map(line => {
    const parts = line.split(',');
    const username = parts[0]?.trim();
    const fullname = parts.length > 1 ? parts.slice(1).join(',').trim() : username;
    return { username, fullname: fullname.substring(0, 50) };
  }).filter(u => u.username.length > 0);

  if (usersToAdd.length === 0) return { error: 'No valid usernames parsed' };

  const db = getFirebaseAdmin();
  
  // We don't check for existing since this is only called when the list is empty,
  // but to be safe, we just use a batch to add them all.
  const batch = db.batch();
  const usersRef = db.collection('users');

  usersToAdd.forEach(user => {
    const docRef = usersRef.doc();
    batch.set(docRef, {
      username: user.username,
      fullname: user.fullname,
      has_voted: false,
      voted_for: [],
      voted_at: null
    });
  });

  await batch.commit();

  revalidatePath('/admin');
  return { success: true };
}

export async function editUser(prevState: any, formData: FormData) {
  await requireAdmin();
  const userId = formData.get('userId') as string;
  const newUsername = formData.get('newUsername') as string;
  const newFullname = formData.get('newFullname') as string || newUsername;
  
  if (!userId || !newUsername) return { error: 'User ID and new username are required' };

  const db = getFirebaseAdmin();
  
  // Check if username is already taken by someone else
  const snapshot = await db.collection('users').where('username', '==', newUsername).get();
  if (!snapshot.empty) {
    const existing = snapshot.docs[0];
    if (existing.id !== userId) {
      return { error: 'Username already exists' };
    }
  }

  await db.collection('users').doc(userId).update({
    username: newUsername,
    fullname: newFullname.substring(0, 50)
  });

  revalidatePath('/admin');
  return { success: true };
}

export async function removeAllUsers(prevState: any, formData: FormData) {
  await requireAdmin();
  
  const db = getFirebaseAdmin();
  const snapshot = await db.collection('users').get();
  
  if (snapshot.empty) {
    return { success: true };
  }

  // Firestore batch allows up to 500 operations
  const chunks = [];
  for (let i = 0; i < snapshot.docs.length; i += 500) {
    chunks.push(snapshot.docs.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function resetAllVotes(prevState: any, formData: FormData) {
  await requireAdmin();
  
  const db = getFirebaseAdmin();
  const snapshot = await db.collection('users').get();
  
  if (snapshot.empty) {
    return { success: true };
  }

  const chunks = [];
  for (let i = 0; i < snapshot.docs.length; i += 500) {
    chunks.push(snapshot.docs.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(doc => {
      batch.update(doc.ref, {
        has_voted: false,
        voted_for: [],
        voted_at: null
      });
    });
    await batch.commit();
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function simulateRandomVotes(prevState: any, formData: FormData) {
  await requireAdmin();
  
  const db = getFirebaseAdmin();
  const snapshot = await db.collection('users').get();
  
  if (snapshot.empty || snapshot.docs.length < 2) {
    return { error: 'Not enough students to simulate votes' };
  }

  const allUserIds = snapshot.docs.map(doc => doc.id);

  const chunks = [];
  for (let i = 0; i < snapshot.docs.length; i += 500) {
    chunks.push(snapshot.docs.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(doc => {
      const currentId = doc.id;
      const numVotes = Math.floor(Math.random() * 3) + 1;
      const otherIds = allUserIds.filter(id => id !== currentId);
      
      for (let i = otherIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherIds[i], otherIds[j]] = [otherIds[j], otherIds[i]];
      }
      
      const votedFor = otherIds.slice(0, numVotes);

      batch.update(doc.ref, {
        has_voted: true,
        voted_for: votedFor,
        voted_at: new Date().toISOString()
      });
    });
    await batch.commit();
  }

  revalidatePath('/admin');
  return { success: true };
}
