'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function loginStudent(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const db = getFirebaseAdmin();
  
  try {
    const settingsDoc = await db.collection('settings').doc('global').get();
    if (!settingsDoc.exists) {
      return { error: 'System not configured. Please contact admin.' };
    }
    
    const settings = settingsDoc.data()!;
    if (settings.student_password !== password) {
      return { error: 'Invalid password' };
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).limit(1).get();
    
    if (snapshot.empty) {
      return { error: 'Username not found in cohort' };
    }

    const userDoc = snapshot.docs[0];
    await createSession(userDoc.id, userDoc.data().username, 'student');
    
  } catch (e: any) {
    console.error('Login error:', e);
    return { error: 'Firebase error: ' + (e.message || String(e)) };
  }
  
  redirect('/vote');
}

export async function loginAdmin(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Password is required' };
  }

  const db = getFirebaseAdmin();
  
  try {
    const settingsDoc = await db.collection('settings').doc('global').get();
    
    // Seed admin if settings doesn't exist
    if (!settingsDoc.exists) {
      // For first time setup, if password matches 'admin123'
      if (password === 'admin123') {
        await db.collection('settings').doc('global').set({
          admin_password: 'admin123',
          student_password: 'student123'
        });
      } else {
         return { error: 'Invalid admin password' };
      }
    } else {
      const settings = settingsDoc.data()!;
      if (settings.admin_password !== password) {
        return { error: 'Invalid admin password' };
      }
    }

    await createSession('admin', 'Admin', 'admin');
    
  } catch (e: any) {
    console.error('Login error:', e);
    return { error: 'Firebase error: ' + (e.message || String(e)) };
  }
  
  redirect('/admin');
}

export async function logout() {
  await deleteSession();
  redirect('/');
}
