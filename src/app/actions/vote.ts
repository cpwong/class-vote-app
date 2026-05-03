'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function castVote(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'student') {
    throw new Error('Unauthorized');
  }

  const nomineeIdsStr = formData.get('nomineeIds') as string;
  if (!nomineeIdsStr) return { error: 'No nominees selected' };
  
  let nomineeIds: string[];
  try {
    nomineeIds = JSON.parse(nomineeIdsStr);
  } catch (e) {
    return { error: 'Invalid selection format' };
  }

  if (!Array.isArray(nomineeIds) || nomineeIds.length === 0) {
    return { error: 'Please select at least 1 classmate' };
  }
  if (nomineeIds.length > 3) {
    return { error: 'You can only vote for up to 3 classmates' };
  }
  if (nomineeIds.includes(session.userId)) {
    return { error: 'You cannot vote for yourself' };
  }

  const db = getFirebaseAdmin();
  const voterRef = db.collection('users').doc(session.userId);

  try {
    await db.runTransaction(async (t) => {
      const voterDoc = await t.get(voterRef);
      if (!voterDoc.exists) {
        throw new Error('User not found');
      }

      // Don't block if they have already voted, allow updates
      
      // Verify all nominees exist
      for (const id of nomineeIds) {
        const nomineeRef = db.collection('users').doc(id);
        const nomineeDoc = await t.get(nomineeRef);
        if (!nomineeDoc.exists) {
          throw new Error('One or more nominees not found');
        }
      }

      t.update(voterRef, {
        has_voted: true,
        voted_for: nomineeIds,
        voted_at: new Date().toISOString()
      });
    });
  } catch (error: any) {
    console.error('Voting error:', error);
    return { error: error.message || 'Failed to cast vote' };
  }

  revalidatePath('/vote');
  revalidatePath('/admin');
  return { success: true };
}
