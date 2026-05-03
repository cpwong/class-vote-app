import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import VoteClient from './VoteClient';

export const dynamic = 'force-dynamic';

export default async function VotePage() {
  const session = await getSession();
  
  if (!session || session.role !== 'student') {
    redirect('/login');
  }

  const db = getFirebaseAdmin();
  
  // Fetch current user data to get initial votes
  const userDoc = await db.collection('users').doc(session.userId).get();
  const userData = userDoc.data();
  let initialVotes: string[] = [];
  if (userData?.voted_for) {
    if (Array.isArray(userData.voted_for)) {
      initialVotes = userData.voted_for;
    } else if (typeof userData.voted_for === 'string') {
      initialVotes = [userData.voted_for];
    }
  }

  // Fetch classmates
  const snapshot = await db.collection('users').get();
  const classmates = snapshot.docs
    .map(doc => ({
      id: doc.id,
      username: doc.data().username,
      fullname: doc.data().fullname || doc.data().username
    }))
    .filter(user => user.id !== session.userId);

  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Nominate a Classmate</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Select up to 3 classmates who have been the most helpful to you. You can change your votes at any time.
      </p>
      
      <VoteClient classmates={classmates} currentUserId={session.userId} initialVotes={initialVotes} />
    </div>
  );
}
